import { HTMLTemplate } from "@coreEnum/htmlTemplate";
import { NotificationTemplate } from "@coreEnum/notificationTemplate";
import { Notification } from "@entities/notification";
import { User } from "@entities/user";
import { SMTP_HOST, SMTP_PASS, SMTP_USER } from "envs";
import { readFile } from "fs";
import logger from "logger";
import { createTransport } from "nodemailer";
import { Options } from "nodemailer/lib/mailer";
import {
  HTMLTemplateData,
  NotificationTemplateData,
  templates,
} from "notification";
import { Role } from "src/model/enums/role";
import { PubSubEngine } from "type-graphql";
import { Service } from "typedi";
import { getRepository } from "typeorm";
import { promisify } from "util";
import { isNotValid, isValid } from "utils";

interface CreateNotification {
  pubSub: PubSubEngine;
  notificationTemplate: NotificationTemplate;
  notificationData: NotificationTemplateData;
  link: string;
  destinationUser?: User;
  destinationRoles?: Role[];
}

@Service()
export class NotificationService {
  async sendMail(
    toAddress: string,
    templateId: NotificationTemplate | HTMLTemplate,
    templateData?: NotificationTemplateData | HTMLTemplateData
  ) {
    const asyncReadFile = promisify(readFile);
    const senderAddress = "Origami Inc <contato@origami.com>";
    // Create the SMTP transport.
    const transporter = createTransport({
      host: SMTP_HOST,
      port: 587,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const options = templates.find(
      (template) => template.messageId === templateId
    );

    const htmlNotificationFolderPath = "src/core/notification/html";

    const htmlDataHeader = await asyncReadFile(
      `${htmlNotificationFolderPath}/common/header.html`,
      "utf8"
    );

    const htmlDataContent = await asyncReadFile(
      `${htmlNotificationFolderPath}/${options.messageId}.html`,
      "utf8"
    );

    const htmlDataFooter = await asyncReadFile(
      `${htmlNotificationFolderPath}/common/footer.html`,
      "utf8"
    );

    let html = htmlDataHeader + htmlDataContent + htmlDataFooter;

    templateData = { ...{ subject: options.subject }, ...templateData };

    Object.entries(templateData).forEach(([key, value]) => {
      const regex = new RegExp(`{{ ${key} }}`, "g");
      html = html.replaceAll(regex, value);
    });

    options.html = html;

    // Specify the fields in the email.
    const mailOptions: Options = {
      ...options,
      ...{
        from: senderAddress,
        to: toAddress,
      },
    };

    // Send the email.
    await transporter
      .sendMail(mailOptions)
      .then(() => {
        logger.info(`Mail ${templateId} sended`);
      })
      .catch(console.error);
  }

  async createNotification({
    pubSub,
    notificationTemplate,
    notificationData,
    link,
    destinationUser,
    destinationRoles,
  }: CreateNotification): Promise<void> {
    let destinationUsers: User[] = [];

    if (isNotValid(destinationUser)) {
      for (const role of destinationRoles) {
        const users = await getRepository(User).find({ where: { role } });

        destinationUsers = [...destinationUsers, ...users];
      }
    } else {
      destinationUsers.push(destinationUser);
    }

    const options = templates.find(
      (template) => template.messageId === notificationTemplate
    );

    if (isValid(notificationData)) {
      Object.entries(notificationData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        options.notificationMessage = options.notificationMessage.replace(
          regex,
          value
        );
      });
    }

    for (const user of destinationUsers) {
      const notification = new Notification();
      notification.message = options.notificationMessage;
      notification.link = link;
      notification.user = user;

      await notification.save();

      this.publishHasNewNotification(pubSub, user.id);
      this.sendMail(user.email, notificationTemplate, notificationData);
    }
  }

  async publishUnreadNotificationCount(
    pubSub: PubSubEngine,
    destinationUserId: string
  ) {
    const unreadNotificationCount = await Notification.count({
      where: { read: false, user: { id: destinationUserId } },
    });

    pubSub.publish(
      `${destinationUserId}-unreadNotificationCount`,
      unreadNotificationCount
    );
  }

  async publishHasNewNotification(
    pubSub: PubSubEngine,
    destinationUserId: string
  ) {
    pubSub.publish(`${destinationUserId}-hasNewNotification`, true);
    this.publishUnreadNotificationCount(pubSub, destinationUserId);
  }
}

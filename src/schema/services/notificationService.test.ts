import { HTMLTemplate } from "@coreEnum/htmlTemplate";
import "reflect-metadata";
import { NotificationService } from "./notificationService";

/**
 * This is not a unit test class,
 * it's a test to check the html of emails
 * and their respective contracts
 */
class NotificationServiceTest {
  constructor(private notificationService: NotificationService) {}

  async sendMails() {
    const username = "Nathan Alcantara";
    const password = "123456789";

    await this.notificationService.sendMail(
      "nathan@mail.com",
      HTMLTemplate.CREATE_USER,
      {
        username,
        password,
        urlLogin: "http://localhost:4200/login",
      }
    );

    await this.notificationService.sendMail(
      "nathan@mail.com",
      HTMLTemplate.FORGOT_PASSWORD,
      {
        urlWithToken: "http://localhost:4200/login?token=12345",
      }
    );

    await this.notificationService.sendMail(
      "nathan@mail.com",
      HTMLTemplate.PASSWORD_CHANGED,
      {
        urlLogin: "http://localhost:4200/login",
      }
    );
  }
}

const notificationServiceTest = new NotificationServiceTest(
  new NotificationService()
);

notificationServiceTest.sendMails();

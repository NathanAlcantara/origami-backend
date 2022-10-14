import { HTMLTemplate } from "@coreEnum/htmlTemplate";
import { NotificationTemplate } from "@coreEnum/notificationTemplate";
import { Options } from "nodemailer/lib/mailer";

interface CreateUserTemplateData {
  username: string;
  password: string;
  urlLogin: string;
}

interface ForgotPasswordTemplateData {
  urlWithToken: string;
}

interface PasswordChangedTemplateData {
  urlLogin: string;
}

export type HTMLTemplateData =
  | CreateUserTemplateData
  | ForgotPasswordTemplateData
  | PasswordChangedTemplateData;

interface NotificationExampleTemplateData {
  username: string;
  key: string;
}

export type NotificationTemplateData = NotificationExampleTemplateData

interface NotificationTemplateOptions extends Options {
  messageId: NotificationTemplate | HTMLTemplate;
  subject: string;
  notificationMessage: string;
  data?: NotificationExampleTemplateData | HTMLTemplateData;
}

export const templates: NotificationTemplateOptions[] = [
  {
    messageId: HTMLTemplate.CREATE_USER,
    subject: "Boas vindas",
    notificationMessage: undefined,
  },
  {
    messageId: HTMLTemplate.FORGOT_PASSWORD,
    subject: "Esqueci minha senha",
    notificationMessage: undefined,
  },
  {
    messageId: HTMLTemplate.PASSWORD_CHANGED,
    subject: "Senha alterada",
    notificationMessage: undefined,
  },
  {
    messageId: NotificationTemplate.KEY,
    subject: "Notificação Exemplo",
    notificationMessage:
      "{{ username }} foi notificado: {{ key }}."
  },
];
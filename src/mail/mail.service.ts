import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { renderTemplate } from './mail.templates';

export interface SendMailInput {
  to: string;
  template: string;
  context?: Record<string, any>;
  subject?: string; // overrides template subject
}

/**
 * Transport-level mail service. Supports two drivers:
 *  - "console": logs the rendered email (default for local dev)
 *  - "smtp": sends through Nodemailer (e.g. MailHog or a real SMTP server)
 *
 * Asynchronous delivery is handled by the EmailQueue + scheduled job, which
 * call send() for each pending message.
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter?: nodemailer.Transporter;
  private readonly driver: string;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    this.driver = config.get<string>('mail.driver', 'console');
    const name = config.get<string>('mail.fromName');
    const address = config.get<string>('mail.fromAddress');
    this.from = `"${name}" <${address}>`;
  }

  onModuleInit() {
    if (this.driver === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: this.config.get<string>('mail.host'),
        port: this.config.get<number>('mail.port'),
        secure: this.config.get<boolean>('mail.secure'),
        auth: this.config.get<string>('mail.user')
          ? {
              user: this.config.get<string>('mail.user'),
              pass: this.config.get<string>('mail.password'),
            }
          : undefined,
      });
    }
  }

  async send(input: SendMailInput): Promise<void> {
    const rendered = renderTemplate(input.template, input.context);
    const subject = input.subject || rendered.subject;

    if (this.driver === 'console' || !this.transporter) {
      this.logger.log(
        `[MAIL:console] to=${input.to} subject="${subject}" template=${input.template}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: input.to,
      subject,
      text: rendered.text,
      html: rendered.html,
    });
    this.logger.log(`[MAIL:smtp] sent to ${input.to} ("${subject}")`);
  }
}

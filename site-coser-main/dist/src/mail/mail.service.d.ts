import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface SendMailInput {
    to: string;
    template: string;
    context?: Record<string, any>;
    subject?: string;
}
export declare class MailService implements OnModuleInit {
    private readonly config;
    private readonly logger;
    private transporter?;
    private readonly driver;
    private readonly from;
    constructor(config: ConfigService);
    onModuleInit(): void;
    send(input: SendMailInput): Promise<void>;
}

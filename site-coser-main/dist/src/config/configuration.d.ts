declare const _default: () => {
    app: {
        env: string;
        name: string;
        port: number;
        globalPrefix: string;
        url: string;
        publicUrl: string;
    };
    database: {
        url: string | undefined;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
        db: number;
        cacheTtl: number;
    };
    jwt: {
        accessSecret: string;
        accessExpiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
        passwordResetExpiresMin: number;
    };
    security: {
        corsOrigins: string[];
        throttleTtl: number;
        throttleLimit: number;
        bcryptSaltRounds: number;
        loginMaxAttempts: number;
        loginLockMinutes: number;
    };
    storage: {
        driver: string;
        localPath: string;
        maxSize: number;
        allowedMime: string[];
        s3: {
            endpoint: string | undefined;
            region: string;
            bucket: string | undefined;
            accessKeyId: string | undefined;
            secretAccessKey: string | undefined;
            publicUrl: string | undefined;
        };
    };
    mail: {
        driver: string;
        host: string;
        port: number;
        secure: boolean;
        user: string | undefined;
        password: string | undefined;
        fromName: string;
        fromAddress: string;
    };
    business: {
        whatsappCountryCode: string;
        leadAssignmentStrategy: string;
        docExpiryAlertDays: number;
        reservationDefaultDays: number;
        vehicleSpecsProvider: string;
        vehicleSpecsApiUrl: string | undefined;
        vehicleSpecsApiKey: string | undefined;
    };
};
export default _default;



export const EnvConfiguration = () => ({
    environment: process.env.NODE_ENV || 'dev',
    mongodb: process.env.MONDODB,
    port: process.env.PORT || 3002
});
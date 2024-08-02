-- CreateTable
CREATE TABLE "Setups" (
    "serverID" TEXT NOT NULL,
    "logsChannel" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "showdisabled" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "Setups_pkey" PRIMARY KEY ("serverID")
);

-- CreateTable
CREATE TABLE "CommandsSetup" (
    "guildID" TEXT NOT NULL,
    "Economy" BOOLEAN NOT NULL DEFAULT true,
    "School" BOOLEAN NOT NULL DEFAULT true,
    "Music" BOOLEAN NOT NULL DEFAULT true,
    "Filter" BOOLEAN NOT NULL DEFAULT true,
    "Programming" BOOLEAN NOT NULL DEFAULT true,
    "Ranking" BOOLEAN NOT NULL DEFAULT true,
    "Voice" BOOLEAN NOT NULL DEFAULT true,
    "Fun" BOOLEAN NOT NULL DEFAULT true,
    "Minigames" BOOLEAN NOT NULL DEFAULT true,
    "CustomQueue" BOOLEAN NOT NULL DEFAULT true,
    "Anime" BOOLEAN NOT NULL DEFAULT true,
    "setupsServerID" TEXT,

    CONSTRAINT "CommandsSetup_pkey" PRIMARY KEY ("guildID")
);

-- CreateTable
CREATE TABLE "ModerationSetup" (
    "guildID" TEXT NOT NULL,
    "muterole" TEXT NOT NULL,
    "AntiScamURL" BOOLEAN NOT NULL DEFAULT true,
    "mutestyle" TEXT NOT NULL DEFAULT 'timeout',
    "DefaultMuteDuration" INTEGER NOT NULL DEFAULT 604800000,
    "setupsServerID" TEXT,

    CONSTRAINT "ModerationSetup_pkey" PRIMARY KEY ("guildID")
);

-- CreateTable
CREATE TABLE "Afk" (
    "message" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "stamp" INTEGER NOT NULL,
    "isAfk" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Mutes" (
    "userID" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guildID" TEXT NOT NULL,
    "muteTime" TIMESTAMP(3),
    "roleID" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DailyMessage" (
    "id" SERIAL NOT NULL,
    "messages" INTEGER NOT NULL,
    "userID" TEXT NOT NULL,
    "serverID" TEXT NOT NULL,

    CONSTRAINT "DailyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyMessage" (
    "id" SERIAL NOT NULL,
    "messages" INTEGER NOT NULL,
    "userID" TEXT NOT NULL,
    "serverID" TEXT NOT NULL,

    CONSTRAINT "WeeklyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "messages" INTEGER NOT NULL,
    "userID" TEXT NOT NULL,
    "serverID" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stats" (
    "datasource" TEXT NOT NULL,
    "commands" INTEGER NOT NULL,
    "songs" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Setups_serverID_key" ON "Setups"("serverID");

-- CreateIndex
CREATE UNIQUE INDEX "Afk_userID_guildID_key" ON "Afk"("userID", "guildID");

-- CreateIndex
CREATE UNIQUE INDEX "Mutes_userID_guildID_key" ON "Mutes"("userID", "guildID");

-- CreateIndex
CREATE UNIQUE INDEX "DailyMessage_userID_serverID_key" ON "DailyMessage"("userID", "serverID");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyMessage_userID_serverID_key" ON "WeeklyMessage"("userID", "serverID");

-- CreateIndex
CREATE UNIQUE INDEX "Message_userID_serverID_key" ON "Message"("userID", "serverID");

-- CreateIndex
CREATE UNIQUE INDEX "Stats_datasource_key" ON "Stats"("datasource");

-- AddForeignKey
ALTER TABLE "CommandsSetup" ADD CONSTRAINT "CommandsSetup_setupsServerID_fkey" FOREIGN KEY ("setupsServerID") REFERENCES "Setups"("serverID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationSetup" ADD CONSTRAINT "ModerationSetup_setupsServerID_fkey" FOREIGN KEY ("setupsServerID") REFERENCES "Setups"("serverID") ON DELETE SET NULL ON UPDATE CASCADE;

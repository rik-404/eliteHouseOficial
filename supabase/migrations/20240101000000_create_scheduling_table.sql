-- CreateEnum
CREATE TYPE "scheduling_status_enum" AS ENUM ('Agendado', 'Confirmado', 'Realizado', 'Cancelado', 'Não compareceu');

-- CreateTable
CREATE TABLE "scheduling" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data" DATE NOT NULL,
    "hora" TIME NOT NULL,
    "status" "scheduling_status_enum" NOT NULL DEFAULT 'Agendado',
    "client_id" UUID NOT NULL,
    "broker_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduling_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "scheduling" ADD CONSTRAINT "scheduling_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduling" ADD CONSTRAINT "scheduling_broker_id_fkey" FOREIGN KEY ("broker_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

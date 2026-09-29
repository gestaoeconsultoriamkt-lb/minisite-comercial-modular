ALTER TABLE `user` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `must_change_password` integer DEFAULT false NOT NULL;--> statement-breakpoint
-- Backfill: neste momento da migration, TODO usuário já existente é, por
-- definição, anterior ao fluxo de criação administrativa de usuários (essa
-- funcionalidade não existia até agora) — promovê-los a "admin" preserva
-- exatamente o acesso irrestrito que qualquer conta já tinha antes desta
-- mudança. Usuários criados a partir de agora pelo admin usam o DEFAULT
-- 'user' acima, nunca esta linha.
UPDATE `user` SET `role` = 'admin';
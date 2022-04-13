import { MigrationInterface, QueryRunner } from "typeorm";

export class migrations1649849974843 implements MigrationInterface {
    name = 'migrations1649849974843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "post_vote" ("value" integer NOT NULL, "postId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_951abb925251a922a769569a112" PRIMARY KEY ("postId", "userId"))`);
        await queryRunner.query(`CREATE TABLE "comment_vote" ("value" integer NOT NULL, "commentId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_9194f426d41fb9a8abc3aae5114" PRIMARY KEY ("commentId", "userId"))`);
        await queryRunner.query(`CREATE TABLE "community" ("id" SERIAL NOT NULL, "name" text NOT NULL, "summary" text NOT NULL, "avatar" character varying, "rules" text NOT NULL, "authorId" integer NOT NULL, "totalPosts" integer NOT NULL DEFAULT '0', "totalUsers" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_696fdadbf0a710efbbf9d98ad9f" UNIQUE ("name"), CONSTRAINT "PK_cae794115a383328e8923de4193" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "authorId" integer NOT NULL, "title" character varying NOT NULL, "body" character varying NOT NULL, "rating" integer NOT NULL DEFAULT '0', "totalComments" integer NOT NULL DEFAULT '0', "totalViews" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "communityId" integer, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" text NOT NULL, "email" text NOT NULL, "password" text NOT NULL, "avatar" character varying, "rating" integer NOT NULL DEFAULT '0', "totalFollowers" integer NOT NULL DEFAULT '0', "totalPosts" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "authorId" integer NOT NULL, "postId" integer NOT NULL, "body" character varying NOT NULL, "rating" integer NOT NULL DEFAULT '0', "parentId" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "session" ("id" character varying NOT NULL, "expiresAt" integer NOT NULL, "data" character varying NOT NULL, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_following_communities_community" ("userId" integer NOT NULL, "communityId" integer NOT NULL, CONSTRAINT "PK_eeb40968f83e3c60833b8ab4a99" PRIMARY KEY ("userId", "communityId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2fde187cadca48f58e054c8fd4" ON "user_following_communities_community" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fdb8894ca12639272247b89995" ON "user_following_communities_community" ("communityId") `);
        await queryRunner.query(`CREATE TABLE "user_following_users_user" ("userId_1" integer NOT NULL, "userId_2" integer NOT NULL, CONSTRAINT "PK_7a14af76467f6c4c0d7135a6ab8" PRIMARY KEY ("userId_1", "userId_2"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e11b7d7b38227499e1b0176a15" ON "user_following_users_user" ("userId_1") `);
        await queryRunner.query(`CREATE INDEX "IDX_426702eb24f3de0604735426da" ON "user_following_users_user" ("userId_2") `);
        await queryRunner.query(`ALTER TABLE "post_vote" ADD CONSTRAINT "FK_73f58f12f594d9c4221f7f3a6dc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_vote" ADD CONSTRAINT "FK_b79b839de435b6c2bcb5a9003d7" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_vote" ADD CONSTRAINT "FK_ade7498b89296b9fb63bcd8dbdd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_vote" ADD CONSTRAINT "FK_5d77d92a6925ae3fc8da14e1257" FOREIGN KEY ("commentId") REFERENCES "comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "community" ADD CONSTRAINT "FK_6555af6981d5e008a40f2a83554" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_eff802f635e95c8aef1998b4843" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_e3aebe2bd1c53467a07109be596" FOREIGN KEY ("parentId") REFERENCES "comment"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_following_communities_community" ADD CONSTRAINT "FK_2fde187cadca48f58e054c8fd4f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_following_communities_community" ADD CONSTRAINT "FK_fdb8894ca12639272247b899950" FOREIGN KEY ("communityId") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_following_users_user" ADD CONSTRAINT "FK_e11b7d7b38227499e1b0176a157" FOREIGN KEY ("userId_1") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_following_users_user" ADD CONSTRAINT "FK_426702eb24f3de0604735426da6" FOREIGN KEY ("userId_2") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_following_users_user" DROP CONSTRAINT "FK_426702eb24f3de0604735426da6"`);
        await queryRunner.query(`ALTER TABLE "user_following_users_user" DROP CONSTRAINT "FK_e11b7d7b38227499e1b0176a157"`);
        await queryRunner.query(`ALTER TABLE "user_following_communities_community" DROP CONSTRAINT "FK_fdb8894ca12639272247b899950"`);
        await queryRunner.query(`ALTER TABLE "user_following_communities_community" DROP CONSTRAINT "FK_2fde187cadca48f58e054c8fd4f"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_e3aebe2bd1c53467a07109be596"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_eff802f635e95c8aef1998b4843"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"`);
        await queryRunner.query(`ALTER TABLE "community" DROP CONSTRAINT "FK_6555af6981d5e008a40f2a83554"`);
        await queryRunner.query(`ALTER TABLE "comment_vote" DROP CONSTRAINT "FK_5d77d92a6925ae3fc8da14e1257"`);
        await queryRunner.query(`ALTER TABLE "comment_vote" DROP CONSTRAINT "FK_ade7498b89296b9fb63bcd8dbdd"`);
        await queryRunner.query(`ALTER TABLE "post_vote" DROP CONSTRAINT "FK_b79b839de435b6c2bcb5a9003d7"`);
        await queryRunner.query(`ALTER TABLE "post_vote" DROP CONSTRAINT "FK_73f58f12f594d9c4221f7f3a6dc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_426702eb24f3de0604735426da"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e11b7d7b38227499e1b0176a15"`);
        await queryRunner.query(`DROP TABLE "user_following_users_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fdb8894ca12639272247b89995"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2fde187cadca48f58e054c8fd4"`);
        await queryRunner.query(`DROP TABLE "user_following_communities_community"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "community"`);
        await queryRunner.query(`DROP TABLE "comment_vote"`);
        await queryRunner.query(`DROP TABLE "post_vote"`);
    }

}

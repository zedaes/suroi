/**
 * Pocketbase singleton to be imported elsewhere
 *
 * Saves us from having to init new Pocketbase() everywhere. Even though
 * it doesn't actually "take up" a database connection (it is just a REST API)
 * we'd rather avoid it.
 */

// @ts-expect-error screw es modules
import Pocketbase from "pocketbase/cjs";
import { Config } from "../config";
import { Logger } from "../utils/misc";

const pocketbase: Pocketbase | undefined = Config.pocketBase?.host ? new Pocketbase(Config.pocketBase.host) : undefined;

export default {
    pocketbase,

    /**
     * Login to Pocketbase as an admin
     */
    async login() {
        // Attempt sign in
        if (!process.env.POCKETBASE_USERNAME || !process.env.POCKETBASE_PASSWORD) throw new Error("Pocketbase username or password not specified");
        try {
            await pocketbase.admins.authWithPassword(process.env.POCKETBASE_USERNAME, process.env.POCKETBASE_PASSWORD);
        } catch (err) {
            Logger.warn("Failed to login to Pocketbase! Check host and credentials.");
            throw err;
        }
    },

    /**
     * Check a users credentials by attempting a login
     *
     * @param username Username/email to check
     * @param password Password to check
     *
     * @returns User ID if valid, false if not
     */
    async checkCredentials(username: string, password: string) {
        if (!pocketbase) throw new Error("Pocketbase not configured");
        const pb = new Pocketbase(Config.pocketBase!.host);
        try {
            await pb.authWithPassword(username, password);
            return pb.authStore.model.id;
        } catch {
            return false;
        }
    },

    /**
     * Check a user's auth token validity by attempting to refresh it
     *
     * @param token Auth token to check
     *
     * @returns User ID if valid, false if not
     */
    async checkToken(token: string) {
        if (!pocketbase) throw new Error("Pocketbase not configured");
        const pb = new Pocketbase(Config.pocketBase!.host);
        pb.authStore.save(token);
        try {
            // Attempt to refresh token
            // If it is not valid, throws an error
            await pb.collection("users").authRefresh();
            return pb.authStore.model.id;
        } catch {
            return false;
        }
    }
};

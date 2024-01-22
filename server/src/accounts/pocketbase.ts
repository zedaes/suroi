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
    async login() {
        // Attempt sign in
        if (!process.env.POCKETBASE_USERNAME || !process.env.POCKETBASE_PASSWORD) throw new Error("Pocketbase username or password not specified");
        try {
            await pocketbase.admins.authWithPassword(process.env.POCKETBASE_USERNAME, process.env.POCKETBASE_PASSWORD);
        } catch (err) {
            Logger.warn("Failed to login to Pocketbase! Check host and credentials.");
            throw err;
        }
    }
};

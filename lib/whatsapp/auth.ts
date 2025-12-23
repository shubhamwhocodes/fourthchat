import { db } from "@/lib/db"
import { whatsappSessions } from "@/lib/schema/whatsapp"
import { AuthenticationCreds, AuthenticationState, BufferJSON, initAuthCreds, SignalDataTypeMap } from "@whiskeysockets/baileys"
import { eq } from "drizzle-orm"

export const createDrizzleAuthState = async (sessionId: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {
    const getSession = async () => {
        return await db.select().from(whatsappSessions).where(eq(whatsappSessions.id, sessionId)).limit(1)
    }

    let creds: AuthenticationCreds
    let keys: Record<string, SignalDataTypeMap[keyof SignalDataTypeMap]> = {}

    const session = await getSession()
    if (session && session.length > 0) {
        const result = session[0]
        creds = JSON.parse(JSON.stringify(result.creds), BufferJSON.reviver)
        keys = JSON.parse(JSON.stringify(result.keys), BufferJSON.reviver)
    } else {
        creds = initAuthCreds()
        keys = {}
    }

    const saveCreds = async () => {
        const session = await getSession()
        const keysJson = JSON.parse(JSON.stringify(keys, BufferJSON.replacer))
        const credsJson = JSON.parse(JSON.stringify(creds, BufferJSON.replacer))

        if (session && session.length > 0) {
            await db.update(whatsappSessions)
                .set({ creds: credsJson, keys: keysJson })
                .where(eq(whatsappSessions.id, sessionId))
        } else {
            await db.insert(whatsappSessions)
                .values({ id: sessionId, creds: credsJson, keys: keysJson })
        }
    }

    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const data: { [key: string]: SignalDataTypeMap[typeof type] } = {}
                    for (const id of ids) {
                        const key = `${type}-${id}`
                        if (keys[key]) {
                            data[id] = keys[key] as SignalDataTypeMap[typeof type]
                        }
                    }
                    return data
                },
                set: (data) => {
                    for (const category in data) {
                        const contextCategory = category as keyof SignalDataTypeMap
                        const categoryData = data[contextCategory]

                        if (!categoryData) continue

                        for (const id in categoryData) {
                            const key = `${contextCategory}-${id}`
                            const value = categoryData[id]

                            if (value) {
                                keys[key] = value
                            } else {
                                delete keys[key]
                            }
                        }
                    }
                }
            }
        },
        saveCreds
    }
}

export const deleteDrizzleAuthState = async (sessionId: string) => {
    await db.delete(whatsappSessions).where(eq(whatsappSessions.id, sessionId))
}

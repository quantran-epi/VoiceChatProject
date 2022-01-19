import AsyncStorage from "@react-native-community/async-storage"

class GlobalDataHelper {
    static keys = {
        ip: "storage-ip"
    }

    static async saveIp(ip: string): Promise<boolean> {
        try {
            await AsyncStorage.setItem(GlobalDataHelper.keys.ip, ip);
            return true;
        } catch (error) {
            console.log("save ip error", error);
            return false;
        }
    }

    static async getIp(): Promise<string> {
        try {
            let ip = await AsyncStorage.getItem(GlobalDataHelper.keys.ip);
            return ip;
        } catch (error) {
            console.log("get ip error", error);
            return "";
        }
    }
}

export default GlobalDataHelper;
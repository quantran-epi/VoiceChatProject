import AsyncStorage from "@react-native-community/async-storage";
import fuzz from 'fuzzball';

interface SavedIntra {
    name: string;
    alias: string;
    accountNumber: string;
}

class SavedIntraHelper {
    static savedIntraStorageKey = "save-intra";

    static async getAll(): Promise<SavedIntra[]> {
        try {
            let intraJson = await AsyncStorage.getItem(SavedIntraHelper.savedIntraStorageKey);
            if (!intraJson) return [];
            let intras = JSON.parse(intraJson) as SavedIntra[];
            return intras;
        } catch (error) {
            console.log('save intra err', error);
            return [];
        }
    }

    static async save(intra: SavedIntra): Promise<boolean> {
        try {
            let intras = await SavedIntraHelper.getAll();
            intras.push(intra);
            await AsyncStorage.setItem(SavedIntraHelper.savedIntraStorageKey, JSON.stringify(intras));
            return true;
        } catch (error) {
            console.log("save intra error", error);
            return false;
        }
    }

    static async search(text: string): Promise<SavedIntra[]> {
        try {
            let intras = await SavedIntraHelper.getAll();
            if (intras.length === 0) return [];
            let searchText = text.trim().toLowerCase();
            let searchResult = fuzz.extract(searchText, intras.map(e => e.alias))
                .filter(e => e[1] > 60)
                .map(e => e[0]);

            return intras.filter(e => searchResult.includes(e.alias));

        } catch (error) {
            console.log("search intra error", error);
        }
    }
}

export default SavedIntraHelper
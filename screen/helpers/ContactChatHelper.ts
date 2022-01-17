import AsyncStorage from '@react-native-community/async-storage';
import { PermissionsAndroid } from 'react-native';
import Contacts, { Contact } from 'react-native-contacts';
import fuzz from 'fuzzball';

export type CustomContact = Pick<Contact, "displayName" | "phoneNumbers">;

class ContactChatHelper {
    static contactStorageKey = "contacts"

    static async saveAllContact(): Promise<boolean> {
        let granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            {
                'title': 'Contacts',
                'message': 'This app would like to view your contacts.',
                'buttonPositive': 'Please accept bare mortal'
            }
        )
        if (granted !== "granted") return false;
        try {
            let contacts = await Contacts.getAll() || [];
            await AsyncStorage.setItem(ContactChatHelper.contactStorageKey,
                JSON.stringify(contacts.map<CustomContact>(e => ({
                    displayName: e.displayName,
                    phoneNumbers: e.phoneNumbers.map(e => ({
                        label: e.label,
                        number: e.number.replace(/\s/g, "")
                    }))
                }))));
            return true;
        } catch (error) {
            return false;
        }
    }

    static async search(name: string): Promise<CustomContact[]> {
        let contactJson = await AsyncStorage.getItem(ContactChatHelper.contactStorageKey);
        if (!contactJson) return [];
        let contacts = JSON.parse(contactJson) as CustomContact[];
        if (contacts.length === 0) return [];

        let searchResult = fuzz.extract(name, contacts.map(e => e.displayName))
            .filter(e => e[1] > 60)
            .map(e => e[0]);
        return contacts.filter(e => searchResult.includes(e.displayName));
        // let searchResult = fuzz.extract(name, contacts.map(e => e.displayName))
        //     .filter(e => e[1] > 60); console.log("search result", searchResult);
        // return []
    }
}

export default ContactChatHelper
export abstract class LocalStorage 
{
    //TODO: Save(string,ISerializable)
    //TODO: Save(string,T => string)
    //reverse for load

    public static Save(key:string, content:string):void
    {
        localStorage.setItem(key, content);
    }

    public static SaveT<T>(key:string, content:T, serializaer:(o:T)=>string):void
    {
        const serialized:string = serializaer(content);
        LocalStorage.Save(key,serialized)
    }

    public static Load(key:string):string|null
    {
        return window.localStorage.getItem(key);
    }

    public static LoadT<T>(key:string, deserializer:(o:string)=>T):T|null
    {
        const json = LocalStorage.Load(key);
        if(json === null) return null;
        try {
            const parsed:T = deserializer(json);
            return parsed;
        } catch(error) {
            console.log(error);
            return null;
        }
    }
}
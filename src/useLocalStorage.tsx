import { useState } from "react";

//Thanks to: https://usehooks.com/useLocalStorage/

function useLocalStorage(key:string, initialValue:string):[string,(value:string)=>void] {
  
    const [storedValue, setStoredValue] = useState(() => {
      try {  
        const item = window.localStorage.getItem(key);
        return item || initialValue;
      } catch (error) {
        return initialValue;
      }
  
    });
  
    const setValue = (value:string) => {
  
      try {
        const valueToStore = value;
        setStoredValue(valueToStore);
        //Potential upgrade: Define an ISerializable interface and receive and object of that interface
        localStorage.setItem(key, valueToStore);
      } catch (error) {
        console.log(error);
      }
  
    };
    return [storedValue, setValue];
  
  }

export default useLocalStorage
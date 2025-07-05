import {create} from 'zustand';

export const useThemeStore = create((set) =>({
    theme: localStorage.getItem("theme") || "light",
    setTheme:(theme:string)=>{
        set({theme});
        localStorage.setItem("theme",theme);
    }
    })
)
export interface Box {
    id: number;
    title: string;
    hero: string | null;
    link: string;
    color: string;
  }
  
  export function useBox() {
    const boxes = ref<Box[]>([
      { id: 1,title: 'A1', hero: "Darajadagilar uchun", link: "/", color: "blue" },
      { id: 2,title: 'B1', hero: "Darajadagilar uchun", link: "/", color: "green" },
      { id: 3,title: 'C1', hero: "Darajadagilar uchun", link: "/", color: "red" },
      { id: 4,title: 'A2', hero: "Darajadagilar uchun", link: "/", color: "blue" },
      { id: 5,title: 'B2', hero: "Darajadagilar uchun", link: "/", color: "green" },
      { id: 6,title: 'Multilevel', hero: null, link: "/tests/multilevel", color: "orange" },
    ]);
  
    return { boxes };
  }
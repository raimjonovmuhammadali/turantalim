export interface Box {
    id: number;
    title: string;
    hero: string | null;
    link: string;
    color: string;
  }
  
  export function useBox() {
    const boxes = ref<Box[]>([
      { id: 1,title: 'a1', hero: "Darajadagilar uchun", link: "/tests/listtest", color: "blue" },
      { id: 2,title: 'b1', hero: "Darajadagilar uchun", link: "/tests/listtest", color: "green" },
      { id: 3,title: 'c1', hero: "Darajadagilar uchun", link: "/tests/listtest", color: "red" },
      { id: 4,title: 'a2', hero: "Darajadagilar uchun", link: "/tests/listtest", color: "blue" },
      { id: 5,title: 'b2', hero: "Darajadagilar uchun", link: "/tests/listtest", color: "green" },
      { id: 6,title: 'multilevel', hero: null, link: "/tests/", color: "orange" },
    ]);
  
    return { boxes };
  }
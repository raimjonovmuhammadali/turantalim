export interface Box {
    id: number;
    title: string;
    hero: string | null;
    link: string;
    color: string;
  }
  
  export function useBox() {
    const boxes = ref<Box[]>([
      { id: 1,title: 'a1', hero: "Seviye testleri", link: "/tests/listtest", color: "blue" },
      { id: 2,title: 'a2', hero: "Seviye testleri", link: "/tests/listtest", color: "blue" },
      { id: 3,title: 'b1', hero: "Seviye testleri", link: "/tests/listtest", color: "green" },
      { id: 4,title: 'b2', hero: "Seviye testleri", link: "/tests/listtest", color: "green" },
      { id: 5,title: 'c1', hero: "Seviye testleri", link: "/tests/listtest", color: "red" },
      { id: 6,title: 'multilevel', hero: null, link: "/tests/", color: "orange" },
    ]);
  
    return { boxes };
  }
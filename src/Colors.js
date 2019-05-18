export default class Colors {
  constructor() {
    this.colors = [
      { isAvailable: true, label: "blue", bg: "#4363d8", fg: "#ffffff" },
      { isAvailable: true, label: "yellow", bg: "#ffe119", fg: "#000000" },
      { isAvailable: true, label: "maroon", bg: "#800000", fg: "#ffffff" },
      { isAvailable: true, label: "teal", bg: "#469990", fg: "#ffffff" },
      { isAvailable: true, label: "black", bg: "#000000", fg: "#ffffff" },
      { isAvailable: true, label: "orange", bg: "#f58231", fg: "#ffffff" },
      { isAvailable: true, label: "pink", bg: "#fabebe", fg: "#000000" },
      { isAvailable: true, label: "green", bg: "#3cb44b", fg: "#ffffff" },
      { isAvailable: true, label: "purple", bg: "#911eb4", fg: "#ffffff" },
      { isAvailable: true, label: "brown", bg: "#9A6324", fg: "#ffffff" },
      { isAvailable: true, label: "lavender", bg: "#e6beff", fg: "#000000" },
      { isAvailable: true, label: "navy", bg: "#000075", fg: "#ffffff" },
      { isAvailable: true, label: "cyan", bg: "#42d4f4", fg: "#000000" },
      { isAvailable: true, label: "magenta", bg: "#f032e6", fg: "#ffffff" },
      { isAvailable: true, label: "red", bg: "#e6194B", fg: "#ffffff" },
      { isAvailable: true, label: "lime", bg: "#bfef45", fg: "#000000" },
      { isAvailable: true, label: "beige", bg: "#fffac8", fg: "#000000" },
      { isAvailable: true, label: "mint", bg: "#aaffc3", fg: "#000000" },
      { isAvailable: true, label: "olive", bg: "#808000", fg: "#ffffff" },
      { isAvailable: true, label: "apricot", bg: "#ffd8b1", fg: "#000000" }
    ];
  }

  getColor = () => {
    const color = this.colors.find(c => c.isAvailable);
    if (!color) return { label: "overflow", bg: "#a9a9a9", fg: "#ffffff" };
    color.isAvailable = false;
    return color;
  };

  freeColor = color => {
    if (color.label === "overflow") return;
    this.colors.find(c => c.label === color.label).isAvailable = true;
  };
}

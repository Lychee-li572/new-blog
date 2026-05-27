export interface City {
  id: string
  name: string
  province: string
  coordinates: [number, number]
  photos: string[]
  travelFile: string
}

export const cities: City[] = [
  {
    id: "nanning",
    name: "南宁",
    province: "广西壮族自治区",
    coordinates: [108.3665, 22.8170],
    photos: [
      "南宁/IMG20260430135217.jpg",
      "南宁/IMG20260501130701.jpg",
      "南宁/IMG20260504195933.jpg",
      "南宁/IMG20260505121354.jpg",
      "南宁/IMG_5762.jpg",
      "南宁/IMG_5764.jpg",
      "南宁/IMG_5771(1).jpg",
      "南宁/IMG_5845.jpg",
      "南宁/IMG_5859.jpg"
    ],
    travelFile: "nanning.md"
  },
  {
    id: "ningbo",
    name: "宁波",
    province: "浙江省",
    coordinates: [121.5435, 29.8683],
    photos: [
      "宁波/IMG20260326203645.jpg",
      "宁波/IMG20260329201600.jpg",
      "宁波/IMG20260402185555.jpg",
      "宁波/IMG20260409185335.jpg",
      "宁波/IMG20260505121354.jpg"
    ],
    travelFile: "ningbo.md"
  },
  {
    id: "huangshan",
    name: "黄山",
    province: "安徽省",
    coordinates: [118.3375, 29.7147],
    photos: [
      "黄山/IMG20260405142304.jpg",
      "黄山/IMG20260405161138.jpg",
      "黄山/IMG_3985.jpg",
      "黄山/IMG_3995.jpg",
      "黄山/IMG_3996.jpg"
    ],
    travelFile: "huangshan.md"
  }
]

export function getCityById(id: string): City | undefined {
  return cities.find(c => c.id === id)
}

export function getVisitedProvinces(): string[] {
  return [...new Set(cities.map(c => c.province))]
}

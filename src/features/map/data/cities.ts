import photosData from "@/features/map/data/photos.json"

export interface City {
  id: string
  name: string
  province: string
  coordinates: [number, number]
  /** 图片路径列表，构建时从 GitHub API 自动生成 */
  photos: string[]
  travelFile: string
}

const photoMap: Record<string, string[]> = photosData

export const cities: City[] = [
  {
    id: "nanning",
    name: "南宁",
    province: "广西壮族自治区",
    coordinates: [108.3665, 22.8170],
    photos: photoMap["南宁"] ?? [],
    travelFile: "nanning.md"
  },
  {
    id: "ningbo",
    name: "宁波",
    province: "浙江省",
    coordinates: [121.5435, 29.8683],
    photos: photoMap["宁波"] ?? [],
    travelFile: "ningbo.md"
  },
  {
    id: "huangshan",
    name: "黄山",
    province: "安徽省",
    coordinates: [118.3375, 29.7147],
    photos: photoMap["黄山"] ?? [],
    travelFile: "huangshan.md"
  },
  {
    id: "zhoushan",
    name: "舟山",
    province: "浙江省",
    coordinates: [122.2063, 30.0197],
    photos: photoMap["舟山"] ?? [],
    travelFile: "zhoushan.md"
  }
]

export function getCityById(id: string): City | undefined {
  return cities.find(c => c.id === id)
}

export function getVisitedProvinces(): string[] {
  return [...new Set(cities.map(c => c.province))]
}

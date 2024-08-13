import Link from "next/link"

const navItems = {
  "/minigame/matching-card": {
    name: "Matching Card"
  },
  "/minigame/connection": {
    name: "Connection"
  },
  "/minigame/higher-lower": {
    name: "Higher Lower"
  },
}

export default function MiniGameList() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{
      Object.entries(navItems).map(([path, { name }]) => (
        <Link key={path} href={path}>
          <div className="border rounded-md w-full">
            <div className="h-24"></div>
            <div className="p-4">
              <h2 className="font-bold">
                {name}
              </h2>
              <p className="text-muted-foreground">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Id, enim.
              </p>
            </div>
          </div>
        </Link>
      ))
    }
    </div>
  )
}

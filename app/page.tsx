import Link from "next/link"


const links = [{
  link: "/match-card",
  name: "Matching Card"
},
{
  link: "/2048",
  name: "2048"
}
]

export default function Home() {
  return (
    <main>
      <h1 className="3xl font-bold text-center">Minigame</h1>

      <div className="max-w-xl mx-auto">
        <div className="grid grid-cols-4 gap-4 p-4">
          {
            links.map(link => (
              <Link key={link.name} href={link.link}>
                <div className=" w-full border rounded-md p-4">
                  <p>{link.name}</p>
                </div>
              </Link>
            ))
          }

        </div>
      </div>
    </main>
  );
}

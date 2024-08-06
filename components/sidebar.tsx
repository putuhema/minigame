import { BeakerIcon } from "@heroicons/react/24/outline";
import FilesystemItem from "./filesystem-item";
import Link from "next/link";

type Node = {
  name: string;
  nodes?: Node[];
};

const nodes: Node[] = [
  {
    name: 'Mini Games',
    nodes: [
      {
        name: 'match-card',
      },
      {
        name: 'documentation'
      }
    ],
  },
];
export default function Sidebar() {
  return (
    <div className="p-4 w-[20rem]">
      <Link href="/">
        <div className="flex gap-1.5 items-center mb-4">
          <BeakerIcon className="size-5 text-green-500" />
          <p className="font-bold">asdf.proj</p>
        </div>
      </Link>
      <ul>
        {nodes.map((node) => (
          <FilesystemItem node={node} key={node.name} />
        ))}
      </ul>

    </div>
  )
}

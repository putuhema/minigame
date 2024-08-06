"use client"

import * as React from "react";
import { ChevronRightIcon, FolderIcon, LinkIcon } from "@heroicons/react/24/outline"
import Link from "next/link";
import { usePathname } from "next/navigation";

type Node = {
  name: string;
  nodes?: Node[]
}

export default function FilesystemItem({ node }: { node: Node }) {
  const path = usePathname()
  const [isOpen, setIsOpen] = React.useState(true);
  return (
    <li key={node.name}>
      <span className="flex items-center gap-1.5 py-1">
        {
          node.nodes && node.nodes.length > 0 && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 -m-1"
            >
              <ChevronRightIcon
                className={`size-4 text-gray-500 ${isOpen ? 'rotate-90' : ''}`}
              />
            </button>
          )
        }
        {node.nodes ? (
          <>
            <FolderIcon
              className={`size-4 ${node.nodes.length === 0 ? 'ml-[22px]' : ''
                }`}
            />
            {node.name}
          </>
        ) : (
          <Link
            href={`/${node.name}`}
            className={`flex italic items-center gap-2 hover:text-green-500 hover:underline ${path === `/${node.name}` ? 'text-green-600 underline' : ''}`}>
            <LinkIcon className="ml-[22px] size-3 text-gray-900" />
            {node.name}
          </Link>
        )}
      </span>

      {isOpen && (
        <ul className="pl-6">
          {node.nodes?.map((node) => (
            <FilesystemItem node={node} key={node.name} />
          ))}
        </ul>
      )}
    </li>
  )
}

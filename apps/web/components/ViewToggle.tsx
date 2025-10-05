"use client";
import { useUIStore } from "@/lib/stores";
import { useEffect } from "react";
import {Tabs, TabsList, TabsTrigger} from "@workspace/ui/Tabs";

export default function ViewToggle() {
    const { viewMode, setViewMode } = useUIStore();

    useEffect(() => {
        localStorage.setItem("viewMode", viewMode);
    }, [viewMode]);

    return (
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "board" | "table")}>
            <TabsList>
                <TabsTrigger value="board">Board</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
        </Tabs>
    );
}
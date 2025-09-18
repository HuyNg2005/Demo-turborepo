import {Button} from "@workspace/ui/components/button";
import {Card} from "@workspace/ui/components/card";


export default function Page() {
    return (
        <main className=" p-10">
            <Card className="p-6">
                <div className="flex flex-col justify-center items-center">
                <h1 className=" text-2xl font-bold mb-4 ">Demo-Turbo</h1>
                <Button>Click Me</Button>
                </div>
            </Card>
        </main>
    );
}

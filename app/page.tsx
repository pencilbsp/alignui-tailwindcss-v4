import * as Accordion from "@/components/core/accordion";

export default function Home() {
    return (
        <div className="animate-wiggle w-full max-w-96 p-4">
            <Accordion.Root type="single" collapsible className="space-y-6">
                <Accordion.Item value="a">
                    <Accordion.Trigger>
                        <Accordion.Arrow />
                        Insert your accordion title here
                    </Accordion.Trigger>
                    <Accordion.Content className="pl-[30px]">
                        Insert the accordion description here. It would look better as two lines of text.
                    </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="b">
                    <Accordion.Trigger>
                        <Accordion.Arrow />
                        Insert your accordion title here
                    </Accordion.Trigger>
                    <Accordion.Content className="pl-[30px]">
                        Insert the accordion description here. It would look better as two lines of text.
                    </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item value="c">
                    <Accordion.Trigger>
                        <Accordion.Arrow />
                        Insert your accordion title here
                    </Accordion.Trigger>
                    <Accordion.Content className="pl-[30px]">
                        Insert the accordion description here. It would look better as two lines of text.
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
        </div>
    );
}

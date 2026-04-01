import TabsContainer from "./TabsContainer";
import Tab from "./Tab";

type Option = {
    value: number;
    label: string;
}

type TabsProps = {
    tab: number;
    handleChange: (t: number) => void;
    options: Option[];
};

export default function Tabs({ tab, handleChange, options }: TabsProps) {
    return (
        <TabsContainer>
            {options.map((option) => (
                <Tab
                    key={option.value}
                    active={tab === option.value}
                    onClick={() => handleChange(option.value)}
                >
                    {option.label}
                </Tab>
            ))}
        </TabsContainer>
    );
}

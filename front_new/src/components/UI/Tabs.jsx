import { Tabs as MUITabs, Tab } from '@mui/material';
export default function Tabs({ tabs, current, onChange }) {
  return (
    <MUITabs value={current} onChange={(e, v) => onChange(v)}>
      {tabs.map(t => (
        <Tab key={t.value} label={t.label} value={t.value} />
      ))}
    </MUITabs>
  );
}

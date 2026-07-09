import { Input, makeStyles, tokens } from '@fluentui/react-components';
import { DismissRegular, SearchRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  input: { minWidth: '200px', flex: 1 },
});

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/** Client-side incremental search over the visible transcript. */
export function SearchBar({ value, onChange }: SearchBarProps) {
  const styles = useStyles();
  return (
    <Input
      className={styles.input}
      value={value}
      placeholder="ابحث في النص…"
      contentBefore={<SearchRegular />}
      contentAfter={
        value ? (
          <DismissRegular
            aria-label="مسح البحث"
            role="button"
            tabIndex={0}
            onClick={() => onChange('')}
            style={{ cursor: 'pointer', color: tokens.colorNeutralForeground3 }}
          />
        ) : undefined
      }
      onChange={(_e, data) => onChange(data.value)}
      aria-label="بحث في النص"
    />
  );
}

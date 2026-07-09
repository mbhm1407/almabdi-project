import { Button, Input, Text, makeStyles, tokens } from '@fluentui/react-components';
import {
  ChevronUpRegular,
  ChevronDownRegular,
  DismissRegular,
  SearchRegular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flex: 1,
    minWidth: '220px',
  },
  input: { flex: 1 },
  count: {
    color: tokens.colorNeutralForeground3,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    minWidth: '52px',
    textAlign: 'center',
  },
});

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  matchCount: number;
  activeIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

/** Search input with live match count and next/previous result navigation. */
export function SearchBar({
  value,
  onChange,
  matchCount,
  activeIndex,
  onNext,
  onPrev,
}: SearchBarProps) {
  const styles = useStyles();
  const hasQuery = value.trim().length > 0;

  return (
    <div className={styles.wrap}>
      <Input
        className={styles.input}
        value={value}
        placeholder="ابحث في النص…"
        contentBefore={<SearchRegular />}
        contentAfter={
          hasQuery ? (
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
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) onPrev();
            else onNext();
          }
        }}
        aria-label="بحث في النص"
      />
      {hasQuery && (
        <>
          <Text className={styles.count} aria-live="polite">
            {matchCount > 0 ? `${activeIndex + 1}/${matchCount}` : '0/0'}
          </Text>
          <Button
            size="small"
            appearance="subtle"
            icon={<ChevronUpRegular />}
            aria-label="النتيجة السابقة"
            disabled={matchCount === 0}
            onClick={onPrev}
          />
          <Button
            size="small"
            appearance="subtle"
            icon={<ChevronDownRegular />}
            aria-label="النتيجة التالية"
            disabled={matchCount === 0}
            onClick={onNext}
          />
        </>
      )}
    </div>
  );
}

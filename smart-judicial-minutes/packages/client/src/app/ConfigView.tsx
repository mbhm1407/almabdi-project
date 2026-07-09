import { useEffect } from 'react';
import { Body1, Title2, makeStyles, tokens } from '@fluentui/react-components';
import { configureTab } from '../teams/teamsClient';

const useStyles = makeStyles({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalXXL,
    textAlign: 'center',
  },
});

/**
 * Configuration screen rendered when the app is added to a meeting. It registers
 * the Teams save handler so pressing "Save" pins the app to the meeting side
 * panel pointing at the transcript view.
 */
export function ConfigView() {
  const styles = useStyles();

  useEffect(() => {
    const contentUrl = `${window.location.origin}/`;
    void configureTab(contentUrl);
  }, []);

  return (
    <div className={styles.root}>
      <Title2>المحضر الذكي</Title2>
      <Body1>
        سيظهر النسخ المباشر للجلسة في اللوحة الجانبية للاجتماع. اضغط «حفظ» لإضافة التطبيق.
      </Body1>
    </div>
  );
}

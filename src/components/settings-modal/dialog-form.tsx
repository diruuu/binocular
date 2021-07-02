import React from 'react';
import { createStyles, Grid, makeStyles, Theme } from '@material-ui/core';
import BootstrapInput from '../bootstrap-input';
import useSettingForm from './hooks/use-settings-form';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    h6: {
      fontSize: theme.typography.pxToRem(17),
    },
    link: {
      color: theme.palette.secondary.main,
      fontWeight: 500,
    },
    highlight: {
      color: theme.palette.primary.main,
    },
    progress: {
      marginRight: 10,
    },
    settingSection: {},
  })
);

export interface DialogFormRef {
  onSubmit: () => Promise<void>;
}

interface DialogFormProps {
  dialogFormRef: React.MutableRefObject<DialogFormRef | undefined>;
}

export default function DialogForm({ dialogFormRef }: DialogFormProps) {
  const {
    getters: settingFormGetters,
    setters: settingFormSetters,
    submitForm,
    errors: settingFormErrors,
    refs,
  } = useSettingForm();

  dialogFormRef.current = {
    onSubmit: submitForm,
  };

  const classes = useStyles();

  return (
    <>
      <div className={classes.settingSection}>
        <BootstrapInput
          value={settingFormGetters.apiKey}
          placeholder="API Key"
          label="Binance API Key"
          onChange={(event) => settingFormSetters.apiKey(event.target.value)}
          errorMessage={settingFormErrors.apiKey}
          inputRef={refs.apiKey}
        />
        <BootstrapInput
          value={settingFormGetters.secretKey}
          placeholder="Secret Key"
          label="Binance Secret Key"
          onChange={(event) => settingFormSetters.secretKey(event.target.value)}
          errorMessage={settingFormErrors.secretKey}
          inputRef={refs.secretKey}
        />
      </div>
      <div className={classes.settingSection}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <BootstrapInput
              value={settingFormGetters.stopLossRatio}
              placeholder="Stop loss ratio"
              label="Stop loss ratio"
              type="number"
              onChange={(event) =>
                settingFormSetters.stopLossRatio(event.target.value)
              }
              inputRef={refs.stopLossRatio}
              errorMessage={settingFormErrors.stopLossRatio}
            />
          </Grid>
          <Grid item xs={6}>
            <BootstrapInput
              value={settingFormGetters.takeProfitRatio}
              placeholder="Take profit ratio"
              label="Take profit ratio"
              type="number"
              onChange={(event) =>
                settingFormSetters.takeProfitRatio(event.target.value)
              }
              inputRef={refs.takeProfitRatio}
              errorMessage={settingFormErrors.takeProfitRatio}
            />
          </Grid>
        </Grid>
      </div>
      <div className={classes.settingSection}>
        <BootstrapInput
          value={settingFormGetters.restAPIBaseUrl}
          placeholder="REST API Base Url"
          label="REST API Base Url"
          onChange={(event) =>
            settingFormSetters.restAPIBaseUrl(event.target.value)
          }
          inputRef={refs.restAPIBaseUrl}
          errorMessage={settingFormErrors.restAPIBaseUrl}
        />
        <BootstrapInput
          value={settingFormGetters.websocketBaseUrl}
          placeholder="Websocket Base Url"
          label="Websocket Base Url"
          onChange={(event) =>
            settingFormSetters.websocketBaseUrl(event.target.value)
          }
          inputRef={refs.websocketBaseUrl}
          errorMessage={settingFormErrors.websocketBaseUrl}
        />
      </div>
    </>
  );
}

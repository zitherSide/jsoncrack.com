import React from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { init } from "@sentry/nextjs";
import YAML from "js-yaml";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from "src/components/GoogleAnalytics";
import { SupportButton } from "src/components/SupportButton";
import GlobalStyle from "src/constants/globalStyle";
import { darkTheme, lightTheme } from "src/constants/theme";
import useConfig from "src/hooks/store/useConfig";
import useStored from "src/hooks/store/useStored";
import { ThemeProvider } from "styled-components";

if (process.env.NODE_ENV !== "development") {
  init({
    dsn: "https://d3345591295d4dd1b8c579b62003d939@o1284435.ingest.sentry.io/6495191",
    tracesSampleRate: 0.5,
  });
}

function JsonCrack({ Component, pageProps }: AppProps) {
  const { query } = useRouter();
  const lightmode = useStored(state => state.lightmode);
  const setYaml = useConfig(state => state.setYaml);
  const [isRendered, setRendered] = React.useState(false);

  React.useEffect(() => {
    const isYamlValid =
      typeof query.json === "string" && decodeURIComponent(query.json);

    if (isYamlValid) {
      const yamlDecoded = YAML.load(isYamlValid);
      const yamlString = YAML.dump(yamlDecoded);

      setYaml(isYamlValid);
    }
  }, [query.json, setYaml]);

  React.useEffect(() => {
    setRendered(true);
  }, []);

  if (!isRendered) return null;

  return (
    <>
      <GoogleAnalytics />
      <ThemeProvider theme={lightmode ? lightTheme : darkTheme}>
        <GlobalStyle />
        <Component {...pageProps} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#4D4D4D",
              color: "#B9BBBE",
            },
          }}
        />
        <SupportButton />
      </ThemeProvider>
    </>
  );
}

export default JsonCrack;

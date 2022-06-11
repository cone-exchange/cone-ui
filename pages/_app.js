import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import Layout from "../components/layout/layout.js";
import CssBaseline from "@mui/material/CssBaseline";
import { useRouter } from "next/router";

import { useWeb3React } from "@web3-react/core";
import { AppThemeProvider, useAppTheme } from "../ui/AppThemeProvider";

import Configure from "./configure";

import stores from "../stores/index.js";

import { ACTIONS } from "../stores/constants";
import "../styles/global.css";
import "../styles/variables.css";
import "../styles/grid.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import classes from "./home/home.module.css";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const { appTheme, setAppTheme } = useAppTheme();
  const { activate } = useWeb3React();
  const { ERROR, CONNECTION_DISCONNECTED, CONNECTION_CONNECTED, CONFIGURE_SS } =
    ACTIONS;

  const [stalbeSwapConfigured, setStableSwapConfigured] = useState(false);
  const [accountConfigured, setAccountConfigured] = useState(false);

  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  const changeTheme = (dark) => {
    setAppTheme(dark ? "dark" : "light");

    localStorage.setItem("dystopia.finance-dark-mode", dark ? "dark" : "light");
  };

  const accountConfigureReturned = () => {
    setAccountConfigured(true);
  };

  const stalbeSwapConfigureReturned = () => {
    setStableSwapConfigured(true);
  };

  useEffect(function () {
    const localStorageDarkMode = window.localStorage.getItem(
      "dystopia.finance-dark-mode"
    );
    changeTheme(localStorageDarkMode ? localStorageDarkMode === "dark" : true);
  }, []);

  useEffect(function () {
    stores.emitter.on(ACTIONS.CONFIGURED_SS, stalbeSwapConfigureReturned);
    stores.emitter.on(ACTIONS.ACCOUNT_CONFIGURED, accountConfigureReturned);

    stores.dispatcher.dispatch({ type: ACTIONS.CONFIGURE });

    return () => {
      stores.emitter.removeListener(
        ACTIONS.CONFIGURED_SS,
        stalbeSwapConfigureReturned
      );
      stores.emitter.removeListener(
        ACTIONS.ACCOUNT_CONFIGURED,
        accountConfigureReturned
      );
    };
  }, []);

  const validateConfigured = () => {
    switch (router.pathname) {
      case "/":
        return accountConfigured;
      default:
        return accountConfigured;
    }
  };
  useEffect(() => {
    connectWalletOnPageLoad();
  });
  const connectWalletOnPageLoad = async () => {
    if (localStorage?.getItem("isWalletConnected") === "true") {
      try {
        console.log("inn");
        let connected = await stores.accountStore.connectWalletConnect();
        console.log(connected, "inn2");
        if (connected) {
          stores.emitter.emit(CONNECTION_CONNECTED);
          stores.emitter.emit(ACTIONS.ACCOUNT_CONFIGURED);
        }
        localStorage.setItem("isWalletConnected", true);
      } catch (ex) {
        console.log(ex);
      }
    }
    console.log("outt");
  };
  const theme = createTheme({
    typography: {
      allVariants: {
        fontFamily: '"Roboto Mono", serif',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <React.Fragment>
        <Head>
          <title>Dystopia</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <AppThemeProvider value={{ appTheme, setAppTheme }}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          {validateConfigured() && (
            <Layout>
              <Component {...pageProps} changeTheme={changeTheme} />
            </Layout>
          )}

          {!validateConfigured() && (
            <div>
              <img
                src={
                  appTheme === "dark"
                    ? "/images/big-logo--dark.svg"
                    : "/images/big-logo.svg"
                }
                style={{
                  position: "absolute",
                  width: "242px",
                  height: "30px",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          )}
        </AppThemeProvider>
      </React.Fragment>
    </ThemeProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

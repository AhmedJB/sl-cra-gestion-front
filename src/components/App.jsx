import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

// components
import Sign from "./Sign";
import Pannel from "./Pannel";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";

// Contexts

import { UserContext, UserProvider } from "../contexts/UserContext";
import { ToastProvider, useToasts } from "react-toast-notifications";
import { DataContext, DataProvider } from "../contexts/DataContext";
import Nav from "./Nav";
import AnimateNav from "./AnimateNav";
import Supplier from "./Supplier";
import Stock from "./Stock";
import Echeance from "./Echeance";
import Client from "./Client";
import HistoryV from "./HistoryV";
import DateFnsUtils from "@date-io/date-fns";
import frLocale from "date-fns/locale/fr";

// Accounting components
import AccountingDashboard from "./accounting/AccountingDashboard";
import AccountingInvoices from "./accounting/AccountingInvoices";

import AccountingFiscalYears from "./accounting/AccountingFiscalYears";
import AccountingStock from "./accounting/AccountingStock";

const App = (props) => {
  const base = "/appfront/app";

  return (
    <DataProvider>
      <ToastProvider>
        <UserProvider>
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={frLocale}>
            <Router>
              <Switch>
                <Route
                  path={base + "/login"}
                  render={(props) => <Sign login={true} {...props} />}
                ></Route>
                <Route
                  path={base + "/register"}
                  render={(props) => <Sign login={false} {...props} />}
                ></Route>

                <Route
                  path={base + "/supplier"}
                  render={(props) => <Supplier {...props} />}
                ></Route>
                <Route
                  path={base + "/client"}
                  render={(props) => <Client {...props} />}
                ></Route>

                <Route
                  path={base + "/echeance"}
                  render={(props) => <Echeance {...props} />}
                ></Route>
                <Route
                  path={base + "/supply"}
                  render={(props) => <Stock {...props} />}
                ></Route>
                <Route
                  path={base + "/historyv"}
                  render={(props) => <HistoryV {...props} />}
                ></Route>

                {/* Accounting Routes */}
                <Route
                  path={base + "/accounting/invoices"}
                  render={(props) => <AccountingInvoices {...props} />}
                ></Route>

                <Route
                  path={base + "/accounting/fiscal-years"}
                  render={(props) => <AccountingFiscalYears {...props} />}
                ></Route>
                <Route
                  path={base + "/accounting/stock"}
                  render={(props) => <AccountingStock {...props} />}
                ></Route>
                <Route
                  path={base + "/accounting"}
                  render={(props) => <AccountingDashboard {...props} />}
                ></Route>

                <Route
                  path={base + "/pannel"}
                  render={(props) => <Pannel {...props} />}
                ></Route>
              </Switch>
            </Router>
          </MuiPickersUtilsProvider>
        </UserProvider>
      </ToastProvider>
    </DataProvider>
  );
};

export default App;

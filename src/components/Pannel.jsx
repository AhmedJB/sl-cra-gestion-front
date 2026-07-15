import React, { useState, useEffect, useContext, Fragment, useMemo, useCallback, useRef } from "react";
import { UserContext } from "../contexts/UserContext";
import { DataContext } from "../contexts/DataContext";
import { isLogged, req, postReq, download_file } from "../helper";
import { Redirect } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import Chart from "react-apexcharts";
import styled from "styled-components";
import Nav from "./Nav";
import AnimateNav from "./AnimateNav";
import { logout } from "../helper";
import ReactTooltip from "react-tooltip";
import CustomSelect from "./CustomSelect";
import { target_store } from "../config";
import Modal from "./Modal";
import { DatePicker } from "@material-ui/pickers";
import { createTheme } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";

function Pannel(props) {
  const { addToast } = useToasts();
  const [loading, setLoading] = useState(true);
  const [User, setUser] = useContext(UserContext);
  const [Data, setData] = useContext(DataContext);
  const colors = [
    "#5900ff",
    "#5900ff",
    "#5900ff",
    "#5900ff",
    "#5900ff",
    "#5900ff",
    "#5900ff",
  ];
  const pieColors = ["#4f7e9e", "#654ea3", "#804ea0", "#944f9e", "#9b5088"];
  const [Clients, setClients] = useState([]);
  const [Providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [stable, setStable] = useState({
    ventes: {
      quantity: 0,
      total: 0,
    },
    achat: {
      quantity: 0,
      total: 0,
    },
    stock: {
      quantity: 0,
      total: 0,
    },
  });
  const [options, setOptions] = useState({
    chart: {
      id: "basic-bar",
    },
    colors: colors,
    xaxis: {
      categories: [
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
      ],
      labels: {
        style: {
          colors: "#fff",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#fff",
          fontSize: "12px",
        },
      },
    },
  });

  const [ProviderLineOptions, setProviderLineOption] = useState({
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      colors: ["#5900ff"],
    },
    xaxis: {
      type: "datetime",
      categories: [
        "2021-09-28T21:32:46.038306Z",
        "2021-09-28T23:49:15.267100Z",
      ],
      labels: {
        style: {
          colors: "#fff",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#fff",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
    markers: {
      colors: ["#5900ff"],
    },
  });

  const [ProviderLineSeries, setProviderLineSeries] = useState([
    {
      name: "Quantite",
      data: [181, 500],
    },
  ]);
  const [ProviderPieOptions, setProviderPieOptions] = useState({
    labels: [],
    colors: pieColors,
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      colors: ["transparent"],
      width: 0,
    },
    legend: {
      fontSize: "18px",
      labels: {
        colors: "#fff",
      },
    },
  });
  const [ProviderPieSeries, setProviderPieSeries] = useState([]);

  const [clientLineOptions, setClientLineOption] = useState({
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      colors: ["#5900ff"],
    },
    xaxis: {
      type: "datetime",
      categories: [
        "2021-09-28T21:32:46.038306Z",
        "2021-09-28T23:49:15.267100Z",
      ],
      labels: {
        style: {
          colors: "#fff",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#fff",
          fontSize: "12px",
        },
      },
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
    markers: {
      colors: ["#5900ff"],
    },
  });

  const [clientLineSeries, setClientLineSeries] = useState([
    {
      name: "Total",
      data: [181, 500],
    },
  ]);
  const [clientPieOptions, setClientPieOptions] = useState({
    labels: [],
    colors: pieColors,
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      colors: ["transparent"],
      width: 0,
    },
    legend: {
      labels: {
        colors: "#fff",
      },
    },
  });
  const [clientPieSeries, setClientPieSeries] = useState([]);

  const [Articleseries, setArticleSeries] = useState([
    {
      name: "Articles vendu",
      data: [21, 22, 10, 28, 16, 21, 13],
    },
  ]);

  const [Profitseries, setProfitSeries] = useState([
    {
      name: "Profit (DH)",
      data: [21, 22, 10, 28, 16, 21, 13],
    },
  ]);

  useEffect(() => {
    async function test() {
      let resp = await isLogged();
      if (resp) {
        let obj = { ...User };
        obj.logged = true;
        obj.username = resp.username;
        obj.email = resp.email;
        obj.is_accounting_user = resp.is_accounting_user || false;
        setUser(obj);
        await updateUsers();
        await updateStableData();
        await updatePie();
        await fetchSalesData();
        return obj;
      } else {
        logout(setUser, User);
      }
    }

    test().then((obj) => {
      setLoading(false);
      console.log(obj);
      if (props.location.state) {
        if (props.location.state.success) {
          addToast("connecté en tant que " + obj.username, {
            appearance: "success",
            autoDismiss: true,
          });
        }
      }
    });
  }, []);

  useEffect(() => {
    console.log(`Env here `,target_store);
  },[import.meta.env])

  // sales data
  const [saleData, setSalesData] = useState({}); // To store fetched data
  const [selectedSaleProduct, setSelectedSaleProduct] = useState(""); // Currently selected product
  const [chartSellOptions, setChartSellOptions] = useState({}); // ApexCharts options
  const [chartSellLineOptions, setChartSellLineOptions] = useState({}); // ApexCharts options
  const [chartSellSeries, setChartSellSeries] = useState([]); // ApexCharts series
  const [chartSellLineSeries, setChartSellLineSeries] = useState([]); // ApexCharts series

  // Payment method sales by date range
  const today = new Date();
  const [paymentStartDate, setPaymentStartDate] = useState(new Date(today));
  const [paymentEndDate, setPaymentEndDate] = useState(new Date(today));
  const [paymentMethodOptions, setPaymentMethodOptions] = useState({
    chart: {
      id: "payment-method-bar",
      events: {
        dataPointSelection: (event, chartContext, config) => {
          handleBarClick(config.dataPointIndex);
        },
      },
    },
    colors: ["#5900ff", "#4f7e9e", "#654ea3", "#804ea0", "#2e8b57"],
    xaxis: {
      categories: [],
      labels: { style: { colors: "#fff", fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        style: { colors: "#fff", fontSize: "12px" },
        formatter: function (val) { return val + " DH"; },
      },
    },
    plotOptions: {
      bar: {
        distributed: true,
        columnWidth: "50%",
      },
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: true,
      style: { colors: ["#fff"], fontSize: "14px" },
      formatter: function (val) { return val + " DH"; },
    },
  });
  const [paymentMethodSeries, setPaymentMethodSeries] = useState([]);
  const orderResultsRef = useRef([]);
  const [breakdownModalOpen, setBreakdownModalOpen] = useState(false);
  const [breakdownData, setBreakdownData] = useState({ mode: "", clients: [] });

  const materialTheme = createTheme({
    overrides: {
      MuiPickersToolbar: {
        toolbar: { backgroundColor: "#282828" },
      },
      MuiPickersDay: {
        daySelected: { backgroundColor: "#5900ff" },
      },
      MuiInputBase: {
        root: { color: "#fff" },
      },
      MuiInput: {
        underline: {
          "&:before": { borderBottom: "1px solid #5900ff" },
          "&:hover:not(.Mui-disabled):before": { borderBottom: "2px solid #5900ff" },
        },
      },
      MuiFormLabel: {
        root: { color: "#aaa" },
      },
    },
  });

  // Fetch data from the backend
  const fetchSalesData = async () => {
    try {
      const fetchedData = await req("getsalestats");

      // Set the fetched data
      setSalesData(fetchedData);

      // Set the first product as the default selection
      const firstProduct = Object.keys(fetchedData)[0];
      setSelectedSaleProduct(firstProduct);

      // Update the chart with the first product's data
      updateChart(firstProduct, fetchedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch orders via filterorder/ (same as HistoryV) then aggregate by payment mode
  const fetchSalesByMode = async (startDate, endDate) => {
    try {
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
      console.log("fetchSalesByMode sending:", { start, end, iso: { start: start.toISOString(), end: end.toISOString() } });
      const resp = await postReq("filterorder/?page_size=99999", {
        startdate: start,
        enddate: end,
        client: "all",
      });
      console.log("resp:", resp);
      if (!resp || !resp.results) {
        console.log("No resp or no resp.results");
        return;
      }
      console.log("results count:", resp.results.length);
      orderResultsRef.current = resp.results;

      const modeMap = {
        0: "Espèces",
        1: "Chèque",
        2: "Effet",
        3: "Versement",
        4: "Simple",
      };
      const totals = { Espèces: 0, Chèque: 0, Effet: 0, Versement: 0, Simple: 0 };

      for (const item of resp.results) {
        console.log("item.order:", item.order);
        const mode = item.order.mode;
        const total = item.order.total;
        console.log(`mode=${mode}, total=${total}`);
        const label = modeMap[mode] || "Autre";
        totals[label] = (totals[label] || 0) + total;
      }

      console.log("computed totals:", totals);
      const categories = Object.keys(totals);
      const values = Object.values(totals);

      setPaymentMethodOptions((prev) => ({
        ...prev,
        xaxis: { ...prev.xaxis, categories },
      }));
      setPaymentMethodSeries([{ name: "Total (DH)", data: values }]);
    } catch (error) {
      console.error("Error fetching sales by mode:", error);
    }
  };

  const handleBarClick = (dataPointIndex) => {
    const modeMap = { 0: "Espèces", 1: "Chèque", 2: "Effet", 3: "Versement", 4: "Simple" };
    const modeKey = Object.keys(modeMap)[dataPointIndex];
    const modeLabel = modeMap[modeKey];
    const clientTotals = {};
    for (const item of orderResultsRef.current) {
      if (String(item.order.mode) === modeKey) {
        const name = item.client.name;
        clientTotals[name] = (clientTotals[name] || 0) + Number(item.order.total);
      }
    }
    const clients = Object.entries(clientTotals).map(([name, total]) => ({ name, total }));
    clients.sort((a, b) => b.total - a.total);
    setBreakdownData({ mode: modeLabel, clients });
    setBreakdownModalOpen(true);
  };

  const handlePaymentStartChange = (d) => {
    setPaymentStartDate(d);
    fetchSalesByMode(d, paymentEndDate);
  };

  const handlePaymentEndChange = (d) => {
    setPaymentEndDate(d);
    fetchSalesByMode(paymentStartDate, d);
  };

  useEffect(() => {
    fetchSalesByMode(paymentStartDate, paymentEndDate);
  }, []);

  // Function to update the chart based on the selected product
  const updateChart = (product, allData) => {
    const productData = allData[product];

    // Extract months and sales data
    const months = Object.keys(productData);
    const sales = months.map(month => productData[month].total_sales);
    const quantity_sales  = months.map(month => productData[month].total_quantity);
    console.log(product)

    // Update ApexCharts options and series
    setChartSellOptions({
      chart: {
        id: "basic-bar",
      },
      colors: colors,
      xaxis: {
        categories: months,
        labels: {
          style: {
            colors: "#fff",
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#fff",
            fontSize: "12px",
          },
        },
      },
    });

    setChartSellLineOptions({
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        colors: ["#5900ff"],
      },
      xaxis: {
        categories: months,
        labels: {
          style: {
            colors: "#fff",
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#fff",
            fontSize: "12px",
          },
        },
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
      markers: {
        colors: ["#5900ff"],
      },
    })

    setChartSellSeries([
      {
        name: "Total Sales",
        data: sales, // Sales data on the y-axis
      },
    ]);
    setChartSellLineSeries([
      {
        name: "Quantite",
        data: quantity_sales, // Sales data on the y-axis
      },
    ]);
  };

  const handleChangeProduct = useCallback((vs) => {
    console.log(vs)
    let pr = null;
    if (vs.length > 0){
      setSelectedSaleProduct(vs[0].name)
      pr = vs[0].name;
    }else{
      setSelectedSaleProduct(Object.keys(saleData)[0])
      pr = Object.keys(saleData)[0];
    }
  }, [saleData]);

  useEffect(()  => {
    if  (selectedSaleProduct && selectedSaleProduct.length > 0 && saleData){
      console.log(`updating  ${selectedSaleProduct}`)
      updateChart(selectedSaleProduct,saleData);
    }
  },[selectedSaleProduct])

  // functions for data

  async function updatePie() {
    let resp = await req("getranks");
    if (resp) {
      let temppie1 = { ...clientPieOptions };
      temppie1.labels = resp["clients_ranks"].clients;
      let temppie2 = { ...ProviderPieOptions };
      temppie2.labels = resp["providers_ranks"].providers;
      setProviderPieOptions(temppie2);
      setProviderPieSeries(resp["providers_ranks"].quantity);
      setClientPieOptions(temppie1);
      setClientPieSeries(resp["clients_ranks"].total);
    }
  }

  async function updateStableData() {
    let resp = await req("getstable");
    if (resp) {
      let temparticles = [...Articleseries];
      temparticles[0].data = resp.bar.ventes;
      let tempprofits = [...Profitseries];
      tempprofits[0].data = resp.bar.profit;
      setProfitSeries(tempprofits);
      setArticleSeries(temparticles);
      console.log(tempprofits);
      setStable(resp);
    }
  }

  async function updateUsers() {
    let supResp = await req("client/");
    let supResp2 = await req("provider/");
    let obj2 = { ...Data };
    obj2.Clients = supResp;
    obj2.Suppliers = supResp2;
    setClients(supResp);
    setProviders(supResp2);
    setData(obj2);
  }

  const loadSupplierLine = useCallback(async (vs) => {
    let series = [181, 500];
    let cats = ["2021-09-28T21:32:46.038306Z", "2021-09-28T23:49:15.267100Z"];
    if (vs.length != 0) {
      let v = vs[0];
      setSelectedProvider(v.id);
      let resp = await req("getproviderdata/" + v.id);
      if (resp) {
        series = resp.q;
        cats = resp.dates;
      }
    } else {
      setSelectedProvider(null);
    }
    console.log(series);
    let temp = { ...ProviderLineOptions };
    temp.xaxis.categories = cats;
    let temp2 = [...ProviderLineSeries];
    setProviderLineOption(temp);
    temp2[0].data = series;
    setProviderLineSeries(temp2);
  }, [ProviderLineOptions, ProviderLineSeries]);

  const loadClientLine = useCallback(async (vs) => {
    let series = [181, 500];
    let cats = ["2021-09-28T21:32:46.038306Z", "2021-09-28T23:49:15.267100Z"];
    if (vs.length != 0) {
      let v = vs[0];
      setSelectedClient(v.id);
      let resp = await req("getclientdata/" + v.id);
      if (resp) {
        series = resp.q;
        cats = resp.dates;
      }
    } else {
      setSelectedClient(null);
    }
    console.log(series);
    let temp = { ...clientLineOptions };
    temp.xaxis.categories = cats;
    let temp2 = [...clientLineSeries];
    setClientLineOption(temp);
    temp2[0].data = series;
    setClientLineSeries(temp2);
  }, [clientLineOptions, clientLineSeries]);


  const [topProducts, setTopProducts] = useState([]); // State to store fetched data
  const [chartTopOptions, setChartTopOptions] = useState({}); // ApexCharts options
  const [chartTopSeries, setChartTopSeries] = useState([]); // ApexCharts series







  useEffect(() => {
    // Fetch the top 5 products from the backend
    const fetchTopData = async () => {
      try {
        const data = await req("gettop5");

        // Update state with fetched data
        setTopProducts(data);

        // Prepare ApexCharts options and series
        

        const options = {
          labels: data.map((product) => product.product_name),
          colors: pieColors,
          dataLabels: {
            enabled: false,
          },
          stroke: {
            show: true,
            colors: ["transparent"],
            width: 0,
          },
          legend: {
            labels: {
              colors: "#fff",
            },
          },
        }

        const series = data.map((product) => product.total_quantity); // Quantities as series

        // Update chart options and series
        setChartTopOptions(options);
        setChartTopSeries(series);
      } catch (error) {
        console.error("Error fetching top products:", error);
      }
    };

    fetchTopData();
  }, []);









  const Card = styled.div`
    background: #000000;
    background: -webkit-linear-gradient(bottom right, #000000, #282828);
    background: -moz-linear-gradient(bottom right, #000000, #282828);
    background: linear-gradient(to top left, #000000, #282828);
    padding: 30px 20px;
    margin: 50px 15px 0px 15px;
    border-radius: 10px;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.644),
      0px 0px 25px rgba(0, 0, 0, 0.719);
    width: ${(props) => props.width};
    max-width: ${(props) => (props.maxWidth ? props.maxWidth : "90%")};
    height: ${(props) => props.height};
    min-height: ${(props) => props.minHeight};
  `;

  const salesChart = useMemo(() => (
    <div className="row">
      <Card width="90%" height="auto" minHeight="500px">
        <div className="title-select-row">
          <h3 className="card-title text-center inline">Produits</h3>
          <div className="inline">
            <CustomSelect
              options={Object.keys(saleData).map(e=>({name : e}))}
              changeFunc={handleChangeProduct}
              label="name"
              multi={false}
              values={[{name : selectedSaleProduct}]}
              fvalue="name"
              placeholder="Choisir un produit"
            />
          </div>
        </div>
        <div className="center-graph">
          {chartTopSeries.length !== 0 ? (
          <Chart
            options={chartTopOptions}
            series={chartTopSeries}
            type="donut"
            height="600"
            width="300"
          />
        ) : (
          <p>Loading...</p>
        )}
        </div>
        
        <Chart options={chartSellOptions} series={chartSellSeries} type="bar" height="400" />

        <Chart
              options={chartSellLineOptions}
              series={chartSellLineSeries}
              type="line"
              height="400"
            />
      </Card>
    </div>
  ), [saleData, selectedSaleProduct, chartTopSeries, chartTopOptions, chartSellOptions, chartSellSeries, chartSellLineOptions, chartSellLineSeries, handleChangeProduct]);

  const overview = useMemo(() => (
    <div className="row">
      <Card width="450px" height="260px">
        <h3 className="card-title text-center">Ventes</h3>
        <div className="card-value card-row">
          <div className="card-column">
            <p>Articles Vendu</p>
            <p className="circle">{stable.ventes.quantity}</p>
          </div>

          <div className="card-column">
            <p>Total</p>
            <p className="box">{stable.ventes.total + "DH"}</p>
          </div>
        </div>
      </Card>
      <Card width="450px" height="260px">
        <h3 className="card-title text-center">Achat</h3>
        <div className="card-value card-row">
          <div className="card-column">
            <p>Articles Achetes</p>
            <p className="circle">{stable.achat.quantity}</p>
          </div>

          <div className="card-column">
            <p>Total</p>
            <p className="box">{stable.achat.total + "DH"}</p>
          </div>
        </div>
      </Card>
      <Card width="450px" height="260px">
        <h3 className="card-title text-center">Stock</h3>
        <div className="card-value card-row">
          <div className="card-column">
            <p>Articles Disponible</p>
            <p className="circle">{stable.stock.quantity}</p>
          </div>

          <div className="card-column">
            <p>Total</p>
            <p className="box">{stable.stock.total + "DH"}</p>
          </div>
        </div>
      </Card>
    </div>
  ), [stable]);

  const paymentMethodChart = useMemo(() => (
    <div className="row">
      <Card width="90%" height="auto" minHeight="400px">
        <div className="title-select-row">
          <h3 className="card-title text-center inline">Ventes par mode de paiement</h3>
          <div className="inline date-range-picker">
            <ThemeProvider theme={materialTheme}>
              <DatePicker
                variant="inline"
                label="Date début"
                value={paymentStartDate}
                onChange={handlePaymentStartChange}
                format="dd/MM/yyyy"
                animateYearScrolling
              />
              <span className="date-range-separator">—</span>
              <DatePicker
                variant="inline"
                label="Date fin"
                value={paymentEndDate}
                onChange={handlePaymentEndChange}
                format="dd/MM/yyyy"
                animateYearScrolling
              />
            </ThemeProvider>
          </div>
        </div>
        {paymentMethodSeries.length > 0 ? (
          <Chart
            options={paymentMethodOptions}
            series={paymentMethodSeries}
            type="bar"
            height="350"
          />
        ) : (
          <div style={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
            Aucune donnée pour cette période
          </div>
        )}
      </Card>
    </div>
  ), [paymentStartDate, paymentEndDate, paymentMethodOptions, paymentMethodSeries, handlePaymentStartChange, handlePaymentEndChange]);

  const top5chart = (
    <div className="row">
      <div className="card" style={{ width: "90%", height: "auto", minHeight: "500px" }}>
        <div className="title-select-row">
          <h3 className="card-title text-center inline">Top Produits</h3>
        </div>

        {/* Render the chart if data is available */}
        
      </div>
    </div>
  )

  const supplierChart = useMemo(() => (
    <div className="row">
      <Card width="90%" height="auto" minHeight="500px">
        <div className="title-select-row">
          <h3 className="card-title text-center inline">Fournisseur</h3>
          <div className="inline">
            <CustomSelect
              options={Data.Suppliers}
              changeFunc={loadSupplierLine}
              label="name"
              multi={false}
              values={Data.Suppliers.filter((e) => e.id == selectedProvider)}
              fvalue="id"
              placeholder="Choisir un Fournisseur"
            />
          </div>
        </div>

        <div className="inner-row">
          <div className="grow">
            <Chart
              options={ProviderLineOptions}
              series={ProviderLineSeries}
              type="line"
              height="400"
            />
          </div>
          {ProviderPieSeries.length != 0 ? (
            <Chart
              options={ProviderPieOptions}
              series={ProviderPieSeries}
              type="donut"
              height="600"
              width="300"
            />
          ) : (
            ""
          )}
        </div>
      </Card>
    </div>
  ), [Data.Suppliers, loadSupplierLine, selectedProvider, ProviderLineOptions, ProviderLineSeries, ProviderPieOptions, ProviderPieSeries]);

  const clientChart = useMemo(() => (
    <div className="row">
      <Card width="90%" height="auto" minHeight="500px">
        <div className="title-select-row">
          <h3 className="card-title text-center inline">Clients</h3>
          <div className="inline">
            <CustomSelect
              options={Data.Clients}
              changeFunc={loadClientLine}
              label="name"
              multi={false}
              values={Data.Clients.filter((e) => e.id == selectedClient)}
              fvalue="id"
              placeholder="Choisir un Client"
            />
          </div>
        </div>
        <div className="inner-row">
          <div className="grow">
            <Chart
              options={clientLineOptions}
              series={clientLineSeries}
              type="line"
              height="400"
            />
          </div>
          {clientPieSeries.length != 0 ? (
            <Chart
              options={clientPieOptions}
              series={clientPieSeries}
              type="donut"
              height="600"
              width="300"
            />
          ) : (
            ""
          )}
        </div>
      </Card>
    </div>
  ), [Data.Clients, loadClientLine, selectedClient, clientLineOptions, clientLineSeries, clientPieOptions, clientPieSeries]);

  const profitChart = (
    <div className="row">
      <Card width="90%" height="500px">
        <h3 className="card-title text-center">Profit</h3>
        <Chart
          options={options}
          series={Profitseries}
          type="bar"
          height="400"
        />
      </Card>
    </div>
  );

  const articleChart = (
    <div className="row">
      <Card width="90%" height="500px">
        <h3 className="card-title text-center">Ventes</h3>
        <Chart
          options={options}
          series={Articleseries}
          type="bar"
          height="400"
        />
      </Card>
    </div>
  );

  const html = (
    <Fragment>
      <AnimateNav />
      <ReactTooltip id="test"></ReactTooltip>
      <div className="pannel-container">
        {overview}
        {salesChart}
        {paymentMethodChart}
        {supplierChart}
        {clientChart}
        {articleChart}
        {profitChart}

      </div>

      <Modal open={breakdownModalOpen} closeFunction={() => setBreakdownModalOpen(false)}>
        <div className="breakdown-modal">
          <h2 className="breakdown-title">Clients — {breakdownData.mode}</h2>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Total (DH)</th>
              </tr>
            </thead>
            <tbody>
              {breakdownData.clients.length > 0 ? (
                breakdownData.clients.map((c, i) => (
                  <tr key={i}>
                    <td>{c.name}</td>
                    <td>{c.total.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="2">Aucun client</td></tr>
              )}
            </tbody>
          </table>
          <style>{`
            .breakdown-modal { padding: 24px; min-width: 400px; background: #fff; border-radius: 8px; }
            .breakdown-title { margin: 0 0 16px; color: #333; font-size: 18px; }
            .breakdown-table { width: 100%; border-collapse: collapse; }
            .breakdown-table th, .breakdown-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e0e0e0; color: #333; }
            .breakdown-table th { background: #f5f5f5; font-weight: 600; }
          `}</style>
        </div>
      </Modal>
    </Fragment>
  );

  const loader = (
    <div className="animation-container">
      <div className="lds-facebook">
        <div />
        <div />
        <div />
      </div>
    </div>
  );

  return loading ? (
    loader
  ) : User.logged && User.is_accounting_user ? (
    <Redirect
      to={{
        pathname: "/appfront/app/accounting",
        state: { error: true, msg: "Accès refusé" },
      }}
    />
  ) : User.logged ? (
    html
  ) : (
    <Redirect
      to={{
        pathname: "/appfront/app/login",
        state: { error: true, msg: "Please Login" },
      }}
    />
  );
}

export default Pannel;

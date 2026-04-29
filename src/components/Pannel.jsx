import React, { useState, useEffect, useContext, Fragment, useMemo, useCallback } from "react";
import { UserContext } from "../contexts/UserContext";
import { DataContext } from "../contexts/DataContext";
import { isLogged, req, download_file } from "../helper";
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
    let supResp = await req("client");
    let supResp2 = await req("provider");
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
        {supplierChart}
        {clientChart}
        {articleChart}
        {profitChart}

      </div>
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

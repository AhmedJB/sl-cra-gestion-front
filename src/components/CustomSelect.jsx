import React, { useState, useEffect, useContext, Fragment } from "react";
import Select from "react-dropdown-select";



function CustomSelect(props) {
    function editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
      
        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
          var lastValue = i;
          for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
              costs[j] = j;
            else {
              if (j > 0) {
                var newValue = costs[j - 1];
                if (s1.charAt(i - 1) != s2.charAt(j - 1))
                  newValue = Math.min(Math.min(newValue, lastValue),
                    costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
              }
            }
          }
          if (i > 0)
            costs[s2.length] = lastValue;
        }
        return costs[s2.length];
      }
    function similarity(s1, s2) {
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
          longer = s2;
          shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength == 0) {
          return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
      }

    function test({props, state, methods}){
        /* console.log(props)
        console.log(state)
        console.log(methods)
        console.log(props.options) */
        console.log(props);
        let opts = props.options;
        let res = []
        for (let i = 0 ; i < opts.length ; i++ ){
            /* let rate = similarity(state.search , opts[i].name);
            if (rate > 0.2){
                console.log(opts[i].name)
            } */
            if (opts[i][props.searchTerm].toLowerCase().startsWith(state.search.toLowerCase())){
                //console.log(res);
                //console.log(opts[i])
                res.push(opts[i])
            }

        }
        //methods.setSearch(props.options[0])
        
        return res;
    }


    return (
        <Select 
    
    options={props.options} 
    onChange={props.changeFunc} 
    labelField= {props.label}
    valueField= {props.fvalue}
    searchable= {true}

    placeholder={props.placeholder}
    searchBy={props.searchBy}
    searchTerm={props.searchTerm ? props.searchTerm : "name"}
    color = "#b187ff"
    className ={props.clas ? props.clas + " CustomDropdown" : "CustomDropdown"} 
    clearable = {props.clearable == false ? props.clearable : true}
    clearOnSelect={true}
    values = {props.values ? props.values : []}
    searchFn={test}
    noDataLabel={"Aucun resultat"}
    multi={props.multi ?  true: false}
    />
    )





}
        

export default CustomSelect;
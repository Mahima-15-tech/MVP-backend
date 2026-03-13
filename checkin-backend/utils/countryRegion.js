function getCountryRegion(phone) {

    if(phone.startsWith("+91")){
     return {country:"India",region:"APAC"}
    }
    
    if(phone.startsWith("+65")){
     return {country:"Singapore",region:"APAC"}
    }
    
    if(phone.startsWith("+61")){
     return {country:"Australia",region:"APAC"}
    }
    
    if(phone.startsWith("+44")){
     return {country:"United Kingdom",region:"EMEA"}
    }
    
    if(phone.startsWith("+971")){
     return {country:"UAE",region:"EMEA"}
    }
    
    if(phone.startsWith("+55")){
     return {country:"Brazil",region:"LATAM"}
    }
    
    return {country:"Unknown",region:"OTHER"}
    
    }
    
    module.exports=getCountryRegion
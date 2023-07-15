import React, { useState, useEffect } from "react";
import { Form, useParams } from "react-router-dom";
import { Grid, Box, Alert } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormView from "./FormView";
import useFetch from "../../hooks/useFetch";
import apiConstants from "../../constants/api";
import { useSelector } from "react-redux";
import SchemaComponent from "../Verifiers/SchemaComponent";
import { SubmissionList } from "./SubmissionList";
import _ from "lodash";

const tmpForm = {
  verifier: "C",
  verifierPublicKey:
    "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCItSPgcBW2822ktGY84alBo1ExGxVEZRPH55hVizRY8jgxSanu/J6ppDwHAz1BwrNgZykIDnS6fxAgatVOqn39o2TPOZ2qU/IdMpl+sD09yfdkoPzgfQNh46TRMmAmv3YDzqCxYnSPfjIcF8kMqFCSN51x5pHnvjVsumrllekXywIDAQAB",
  issuanceDate: "2023-07-14T23:17:11.583Z",
  checks: [
    {
      types: ["$EQ", "UniversityDegreeCredential"],
      degree_type: ["$EQ", "BachelorDegree"],
      year: ["$LT", 2025],
    },
    { types: ["$EQ", "UniversityDegreeCredential"] },
  ],
  requests: ["0.school_name", "1.degree_name"],
  id: "2891a61255c3b4220599003817ed49e09303538cc2fb3eddae052f8af84febe5",
  proof: {
    type: "RSASignature",
    created: "2023-07-14T23:17:11.583Z",
    proofPurpose: "ASSERTION",
    value:
      "f5nCopAXeQ3CVVjvawRPnVUqncRhE/f6SNUhdxftWoIoNypzTpwg3WVdPdhNQhsgMG1ec+sq3GhurBPEjsNrcuppqyeUhRk9jNqHqWP18yGvJlnzIJcqeZd+3QFV/rsWw1Z4NtyRqlgkDZDoQHeY2uEswnZrGdu8cdUhWHH0fDs=",
    verificationMethod:
      "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCItSPgcBW2822ktGY84alBo1ExGxVEZRPH55hVizRY8jgxSanu/J6ppDwHAz1BwrNgZykIDnS6fxAgatVOqn39o2TPOZ2qU/IdMpl+sD09yfdkoPzgfQNh46TRMmAmv3YDzqCxYnSPfjIcF8kMqFCSN51x5pHnvjVsumrllekXywIDAQAB",
  },
};

const tempPresentation = {
  holder: "B",
  schema: {
    verifier: "C",
    verifierPublicKey:
      "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCItSPgcBW2822ktGY84alBo1ExGxVEZRPH55hVizRY8jgxSanu/J6ppDwHAz1BwrNgZykIDnS6fxAgatVOqn39o2TPOZ2qU/IdMpl+sD09yfdkoPzgfQNh46TRMmAmv3YDzqCxYnSPfjIcF8kMqFCSN51x5pHnvjVsumrllekXywIDAQAB",
    issuanceDate: "2023-07-14T23:17:11.583Z",
    checks: [
      {
        types: ["$EQ", "UniversityDegreeCredential"],
        degree_type: ["$EQ", "BachelorDegree"],
        year: ["$LT", 2025],
      },
      { types: ["$EQ", "UniversityDegreeCredential"] },
    ],
    requests: ["0.school_name", "1.degree_name"],
    id: "2891a61255c3b4220599003817ed49e09303538cc2fb3eddae052f8af84febe5",
    proof: {
      type: "RSASignature",
      created: "2023-07-14T23:17:11.583Z",
      proofPurpose: "ASSERTION",
      value:
        "f5nCopAXeQ3CVVjvawRPnVUqncRhE/f6SNUhdxftWoIoNypzTpwg3WVdPdhNQhsgMG1ec+sq3GhurBPEjsNrcuppqyeUhRk9jNqHqWP18yGvJlnzIJcqeZd+3QFV/rsWw1Z4NtyRqlgkDZDoQHeY2uEswnZrGdu8cdUhWHH0fDs=",
      verificationMethod:
        "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCItSPgcBW2822ktGY84alBo1ExGxVEZRPH55hVizRY8jgxSanu/J6ppDwHAz1BwrNgZykIDnS6fxAgatVOqn39o2TPOZ2qU/IdMpl+sD09yfdkoPzgfQNh46TRMmAmv3YDzqCxYnSPfjIcF8kMqFCSN51x5pHnvjVsumrllekXywIDAQAB",
    },
  },
  encryptedData:
    "RybtIs8e8j8nRtFg9Ax7ovfgbg7forOxxIGrZq03BHblFOZRQ6OtA1CJrOneAI5+7owobXWfgVC4nUgF1KyHQPBOiQdTvOw7xfGT2GcGHHm0/CjR48vzb9AJhkjrdfV75lBiusv/Khg3+TIaq097S6DiVHd4TWr9js7ThqlzlB4=SoScJcXSBmr4kYqummDHU5PSMoPiQAAPBa2W/Yfsg3tfT25X2jWrr948Tq2HsvGUE7rsnFZPh3bj+wCju+AiwVaPwCHwwANaChEZNg54f62fxtz4los43Gwh+5RLJ4B+qC3QzX9HXEEguoKj2x7+9O4DrK4p78ThOE6xby6D0p4=RGQrgeETZaCFc5/am73wn24Rwyl+KxmQM4e0MjU9gmC4YGebYffX2xsBCsMic6bwV3asrrjSJ9zKMPgQpxi+K+GiKQps0t2eJXy7W9LX+HUsuGTGB+dTaGnqxBD8yEn9oA4dMn8OBATRBHrFehAq8YmcQQu/2AEkyMfN9tkbxxc=S7tVG9iOPx8XzYFSnp7AOmzOWZ9FhkUB5TAYnxZ1liTuaG6Q7lABKUwKIzfT8fAUyoCR4gBgkn64jWhnVQcDCF7fEVuSzWyhPnB6solsu76AcWJ6gj5aNFWs6ThCF/yh4HCKotjK1yEFGxi6uEKJKslqyl8/uBXamjZcEnKu+Zs=akcI3QrG9EJ/rfs+IX6UQxJqMVYaREuhLSkl440mTlM0iXXQVzc2pwEmxdn5fkfmoMLvFIXuZXLFoawz15YwM3v04gUg2ajyQ7hxo0kKTyF+hyGFjQrpHcRkEWauZv5h8iN4xccObq/s1uxvbDKqkwrziXQ4xHRPN0C5/27KZvU=Ic9jpo96Ny7cDo6FXyGXQ51j+4IuzUuRLkP5cEOjQ7jPld9ZFkUuJHOfN3ZVWJKmLoaDkFYJtARLcL9H5ayBCONgVu8YsGl06WMgLtxQFhTvGqg6mo9IcH+5VDUA0YBUnWk8xVWKc9lUKEu+k8tSqQvME0nRzSEGLuV05tQOcNA=DfuntuCxXZxt+4V7uJLG/837u3uUMTF++qjwdeAKTUTilzXvf4M9zedzCepH4LzrafnNo3fPBk5R2qoCaeotMr5AjZM47Wmd3z4kIbcfsCNQLtmmRaWJ54sHw+UhG+njftF7YM9JYjg3C3lqUhbO8vsCDhMz0+LL//uHeL/Wotg=D2IcHgggtAWuvLyw0nFQHF/azjbpZeW1dMGefbUdKja+FE6vUMn4eRWs9BIhAxwcuueT0Epor/vHExx3W+gI4+DyNYBMhRO/B9xRNQ5sHCMxgQz3577ZJ9OKYitO1XNiOwqYZTIriw/AucUvUlhkIq30pFvqXNYQkK2BCe7bU4k=AcjnGHtIx3r9e5v7xS/5h7JR2/S1UXdpHU5F+0RGiKZhFHumfuw+5HUU0pVWRV9coboSqLQi3OexKy15LUMsWvEwj1tINvFT893bdZglqGOtRYlF87o+05ZdrQ/WvqQs3UNxtp14dpaIlxicLv1NuEnmV19zXrhScv1+m9gfWFs=LcdWH052v56ZfgxjS8/j/RWFvySLJ4xw6at85JwF+uPIqzy5g9HafaJ0/+63Oi0Qre+UwAJrf2lLNXMMbOs5xwfphKJ92+9cpfEbnLi2cVqGtGeD4P8arCe32ecdKA0qWW1qo35ZHKC3h7V0yEuCJs1pOVANpo2s8ObAp4rMXgA=Zxax0R0SWP47ez/2OhUh4DJrWCypAK0p37zQWmBTSEsBE6XDmMz3Y1PRe1IeEIWFip80/UuvWwuvxGgTR4dHSTaCiuU+02V/DENqZ8sBirAdua+uyaDiiqAMWG3UVx7mNecbBGsU9fJs95WxlaSlaK0BxkbxLYJvTWqVaUU9jDs=TddWWRnALB2fMv4RJxmCykt5lJWbvhKI2cd3Zaa6HLmsJliYxHzaGVTqaAFR9I2UGe3Hkz0Oo2Q3jNTqf2L5XzhWLQoQJv0GqOj89lAhluRo6USbBSmdLmCNkGp+7uit0OFSGT/I72s4YiTYLIchUM/kyh2IItQyqGudcS5XLus=K5ZrRksCEqMLXwoBdl1/yF46g6HVAypRsSUZZWq3T5iSYS2+A/JKbskHbog+GXabZawcynSEC37vW9vGgthl1OK2qFgJCWswlVfLWzR/yvQpNyeCZI+rSnJkr5I2/XWgYwIGEx5cyLZJq2+dUWHGWveq5XgyS0DFEWkFgIX0PX8=XHXSv+Aok9AQewrWC6bwj5yG3E1KX2Z0gGaBXhOJpP+bTWWb/dnXDaqIhC9U1aV6QUD86+ctODK/JULbcx3f0k8kHVEwXuyJ8itX9G8NBYzNQ9ds0spNJSl+2zwhbcCsfSsbS9eA3R0qvqSh6zsSx9nmX3RbJW3PVfrAxlbl0hQ=L+sVPLj2tC9wcGn7HKh1yLZqM9OiyWYSifZiZEw2oZvHbo7z4nmVnyw39wpji3lTBsLpv9ImSTSv4hbWnWH7Hv6IKo8BxbUM9uk17ykSmz+mdnf2k2gwmnzTOql2eeUx4I8zF7yYkFZoYx1VP75JQrty2k3j/9Og9iLmjuFY6N4=UJRQISypYT82YKiwokkH7/6T83/CGIa/51CPfcqJ98xDC1tgrgY1cBHWmTBgUKfw4+s+v0O+1kW1LbwxkDQOg7B8kgNKRLM3c3zudpzOhNAPwKYoB1KcyR3lldD3e0PNWygjTOnsn7Z97OnNacYBROrGtII0b/UbIcIJ6lJNXCY=gJI/wqpa/7RJ2/BI1ATmlux0bl9YGzLi2X/7U24X5w9aFfyEwDvLOVkxXD/Xxxwb2D9cnsY1vWGGaXkYD0b2vdNYjcT/xCDFwGsjtLuaPMM1ziEMkW80+R9F7zRDOm2fwMA78eLMhM4ppSIYUY8qhwWwS4GwXNVL2a/YLeBsC+4=MnYkEueduOpiF1QIcOdwLkwdtHbqP1rPgN7Fc6SKfhfPJ1DJ5OHfcupODWnaU/cl1KvpOLJayKfqj2JA8hINFlZ9vnzcTMyRDSMkJ3F6fIzQQTJto74dcsBjnt9Ay+X+cdTWqnNpdC6aER+YkW6K2f+R8G5P8/V1/WNzozUuRXo=J6AWQm16DRLdFya7UzFBuDcdCg4v2qMggbKC0sSnf6FRixhuaJ7Vz3ndQcpV9gb1w71OLhHfDAm0KKO15S2rtWj3O8k2D+kbSxgB3sdgoZPFKwYpFuLaWK9RE6mPIY5QySxZz9wDeWCl+SIuHBxMBQLLu0Y/Sp6jBucVwr5rpWE=NInOIcO0g7Vvx6PQhm+7RNcFz8YZntX8uEz1U6uqCuNUJb+L4CLY7K90RqB/JFui6Y/waMDPa+EkXnx7R75y3xiox6Z37S+ncLlsXesF/f5yxo+sLcrCYqOv5FF73MOIsu0YmxGA9dSNiA6tDCtJrO5BGkAkz/F7Zm0QlrgYJPw=Xn2MlMUG+OMLf3H+QHXs9ut1Lzc5ROCWneHjxxtrQEyyVMygDeFO1Xd57xp+X/YJX9SAc5qKPqd8pWkDOS3Riry78RwufhF7ppUwcFlSs0uaN+ZNTW8l+yoToGyPHT8FusOYYvcsW4aWlaofLMbedGhgbfHSr+hW/XkraAzzLco=IgVc9KcDD0H0tIPkLdF9hiuSR+lJkmAllOLgXJcwwDIwOX6thULTWwiv+AjKxYD+bnEm0cUMdPaxnxrHgtjRg8D2fPjIHiBK9oSIQHto7APBxBBLc+5GZdqK5jIuW7vcTTNaR0UXsNvK/bLd886wdeW1VuCUMILPn9JG174lFuY=Of6WZUBjrJWfcO1iiefWByX/KoSAx6tUQMp6zQzcPBnfHro6rny3LpHlS3anBWXlIqNKaePAPISkLa7louZCnzwYctbLTRMGrh62xkpq2LDlIZSENw2p4IY6fNngwlEZjQf6VUxHpkiCXtFemyKf8q2LJji/5b2tyPQo0TAl5uU=SlokM0zbrp73u871k0xs44lBK1c/4W+LelyY+90VHzPtLE33GfjCfp+0aPtIql5R7a9DWaaZo/Yp9Q3HMWzBN9YEpxdQ6hQp8MFq1tg+JmTu9VIFNn5YclavCq3hF94b8JAcCros71zTt+ge0Yv4IrILGeqznifowkWDbCrsqX0=VFyBqgWAuMwiVhWpLIXiGCG2l9XokNiF7XUFnxhyn1xkNIDNfQMfRZsgZPVaBzUiR6TTz5JopjIpwjRMUECbQjAVBeJYjsgcRz1vIzI9K89OugaOxjrSKmiyuEiNdE2tV8eXi0TRkb1cHSTYI32Fts1/hWIVOGzPFkuV4VIwAII=cCrBbLOWrIXiYQTcBxiBMQvKsBlmnl0T8MG3MIfPHU1IoGndxE736dL/7/KDNP2cHepFgQGNp1jqOSHI7WBa3GjBADUW1dXnzXn3kavF5JxrRdiymNPjLKa78aQIzj1L8a42F+cjgGFNrd5jObcXKCa3JTWBmUiG3zBOJg6Tf90=NH7JQA9wegi1gq8dVqWAjk042eSMPXRfoxs96X1XpOW5bmVTsK/64q3y8osLf7GMccfOUqg9C2DhmW1MyzdBwRpkmUmjjF5ckKwax+eU+dKkgHNolfxoETyj6gvaM10gI9u8N5uLdQaQH/aNQ30ZrVPOztl4p24RnCyMhVmzlh0=Jm6/jkmtrMIOz/rrIq/TtyFgQoYUNDpn0+2zQoyuOem7q78AKX001FUwU5WD00YK+ANRybZqxnVSyan2C6BJM8a/F7b4Rx/OwdIaWwU1XQnCD7oEgMwXOa2upcAwpSoHjQhuVbOCCaHX1MM86/NYT1i4QUM+bSKvKycfXB7fzj0=KsqLBPUhOlI0oivUx/CqY2XpUc7IZXs1Z+DbOCWYfmv0V2+g0ASV6TyBvStHq1cH88CkM1I38qd0GPhfsvCUYBnVJVVm0JHTsJ9IAknpIoXJ+L/m2z9r/jIMy67zUE8Z029bmB76fP0npQtjKOwt4agx5It9oKf002DdZyyKRys=aISIIvpKRKD3aX/PbO0+ehGBxnq8VfeXvOYOKUtpPYI7K3/S1rVl3IT95Mz1Twg4Np8DWXAs+ocV/2nPMD71gwwzTCGfZGVwqwTa3XA3Nq4M0nZKv8ZiPz6ulgRhvIP45ka/Bm4PhvJcaxxLvuZE5+P9MeCTSGS8NcFEHjOKcbM=Yb59gPXNzSB1GZwBo5ohdeTPdYeABs0FZhRLI501Y+vRpf5/suB9THGamfts9gYYNKZsxH3ESmgJ9uS7jzwauroF0m+qpguGbXDzKj7Y0QXMR6NKmtcEEhQnkds4wvmH/XesY5sfbaeX28t6TJgjRqWjLveUUg13Pi4PsbBZiz4=OJsHb9Zcz++suLTS/VAe9/uko41d/4png9Xr2wy9Pf6WXNlxR38BHJVIS4h0Qe8A6niDJgRvNeQDibiQZA6sA+0KktiJTOORyN/9a0NRiOLJnP2Hbd9QHGHOQZXavZ37KHGyLgfgziD6tP1uxC8U4I+FlQoEXJ3xcbEouDwPpyo=Fc03W7Co8ZDXO/WCksEasi9IBawpP2tuX7TKmsAkrpOGdq+J+MhpGgFGs4P76QjIpM30FJ024DggEfihWn4TQUCbJB+gKWUpZIYJ978WIoJ/Y5LF5tP/Vb/zXrZu7yHkREc5Zd1pEUAz1Z/bArJ093kQousfxy/8aGmbHyM5EaI=ayGBB2S0OG1mwUi7bFVW1jpj6/ruxmVK1QSIGxJUfTEwZPgfWzS6AUgrQl76o6eK8dgkPpOOvRy0yVuIXJ3iuCTYP5pJLcJSMr7q6sDBfwqcf5atdIjEl0eSWQPcd4OUD6NJFnZUOS8+Bpw0E9sG/Iu95YKa1/fqgKb8y+dLszA=BxUMJ0eOxT+c1BrgggijoYvKMyJxB8EwpOm7REpXevDNWuBYpLoaFntm85VCvNNNdSp8e0Wuqb1zDLvIbOAUrmuKLIHsE5DQqaXFqY4zNtMgJjPN6+AJ2PfBkhBJT1gB1vRkRmBvCoycKbzgg7jSxukhP0/OHBKWu9fJsF7SGMk=JRF3TYwreCdoRBe2I9iQiSlI8RW4wYpp9LZxsI/bt4TQBKIkfR3la7iQPSqLisrWF+F6AWeBxzCNLrLKyv1egl7IfmhzBQuVrm/x+CHE1oR5xmGk9QSyGp+t2dGyzJoR2+UcvY6Cu4sYDWLUNlzFTijzQfEOIWfVmmS5PNLmrVY=",
  id: "6f3c3bdaf50682903168aa61a94df3182d9614815091626a3cfeeb6af641c729",
  proof: {
    type: "RSASignature",
    created: "2023-07-14T23:17:11.605Z",
    proofPurpose: "ASSERTION",
    value:
      "af8Z6R0ZiEyZ1vtWBEGkcaAFmflUjvOciFZFW4GsV2pMFe/vUrrNyF1/2iWu8Ws89jWOcRFgg12L8pLU64KKkgimSlN1FFgBknPLw8gsEJvzv/ukUpP3lYLLD9LTdtwS+6L+7J5P48fR4LbO1pDtlt2+gy2pGBJ2hKBn5V2AW5M=",
    verificationMethod:
      "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCItSPgcBW2822ktGY84alBo1ExGxVEZRPH55hVizRY8jgxSanu/J6ppDwHAz1BwrNgZykIDnS6fxAgatVOqn39o2TPOZ2qU/IdMpl+sD09yfdkoPzgfQNh46TRMmAmv3YDzqCxYnSPfjIcF8kMqFCSN51x5pHnvjVsumrllekXywIDAQAB",
  },
};

const FormPage = () => {
  const [issueMode, setIssueMode] = useState("one");

  const [submitPresentaion, isSubmitting, submissionError] = useFetch();
  const [getForm, isGettingForm, getFormError] = useFetch();
  const [form, setForm] = useState(tmpForm);
  // const [submissions, setSubmissions] = useState([
  //   _.cloneDeep(tempPresentation),
  //   _.cloneDeep({...tempPresentation, id: "123"}),
  // ]);
  const [submissions, setSubmissions] = useState(null);
  const user = useSelector((store) => store.authSlice.user);

  let { id } = useParams();
  console.log(id);

  useEffect(() => {
    const getMyForm = async () => {
      const credResponse = await getForm(
        `${apiConstants.BASE_API_URL}/api/forms/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.token}`,
          },
        }
      );
      if (credResponse !== null && getFormError === null) {
        console.log(credResponse.data);
        setForm(credResponse.data.schema);
        if (credResponse.data.presentation)
          setSubmissions([credResponse.data.presentation]);
        
      }
    };
    getMyForm();
  }, []);

  const submitForm = async (presentation) => {
    const response = await submitPresentaion(
        `${apiConstants.BASE_API_URL}/api/forms/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            "status": "GOOD",
            "presentation": presentation,
            "name": "Good boy"
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.token}`,
          },
        }
    );
    if (submissionError === null) {
      return true;
    }
    else {
      console.log(submissionError);
      return false;
    }
  }

  const isVerifier =
    form?.verifierPublicKey &&
    user?.publicKey &&
    form?.verifierPublicKey === user?.publicKey;

  return (
    <>
      {getFormError && <Alert severity="error">{getFormError}</Alert>}
      {form && (
        <Box container>
          <SchemaComponent curSchema={form} />
        </Box>
      )}
      {!getFormError &&
        (isVerifier ? (
          submissions ? (
            <SubmissionList submissions={submissions} form={form} />
          ) : (
            <Grid item xs={12}>
                <Alert severity="error">No submission</Alert>
            </Grid>
          )
        ) : (
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="h3">Form</Typography>
            <Box sx={{ width: "100%", typography: "body1" }}>
              <FormView form={form} submitForm={submitForm}/>
            </Box>
          </Grid>
        ))}
    </>
  );
};

export default FormPage;

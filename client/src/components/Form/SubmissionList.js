import { useDispatch, useSelector } from "react-redux";
import { appActions } from "../../redux/slices/appSlice";
import SubmissionComponent from "./SubmissionComponent";

export const SubmissionList = ({ submissions, form }) => {
  return (
    <>
      {submissions.map((submission) => (
        <SubmissionComponent curSubmission = {submission} form = {form}  />
      ))}
    </>
  );
};

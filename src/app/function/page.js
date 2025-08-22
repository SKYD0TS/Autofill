import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

const { default: JobProgress } = require("@/components/FormComponent/JobProgress");

export default function page(){
    const session = getServerSession(authOptions)

    return <JobProgress></JobProgress>
}
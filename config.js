import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 5002;
export const mongoURI = process.env.MONGO_URI;
export const jwtSecret = process.env.JWT_SECRET || "M2iEYMYPN2Kb4gYwfMPC4D60CqumJJysZXAD8uvSfmSwH-AKjTgsJu8ENObeUrhN_WP_oz207ZqMRt4HwfufRWdlqaNrlvcpzrA36EOos55yGIPOWdcUWSMuhuW7M0GwpKAWDg-68D0mughRyzfatvEZ05EnJMIwD7dQE0pSt6PSI22xShvT4torrNu7Xu9Hzp_EB-UOHNN3--dUUK8KrNr_fIjyPSxZuPbdQLMBg4rEeF2kjMDdqa-uzXgzGaWAAQA-LAEN6Gj5uIQchor6OcbBE_yseOnTERw8YFL1WlcSZIsdmpPQMixOAZ5E4lzfUucAsKCJBzkeUZLtKqcnMQ";
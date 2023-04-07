import { IForm } from "./interface";

const Form = (props: IForm) => {
  

  return (
    <form>
      {props.children}
    </form>
  )
}

export default Form;
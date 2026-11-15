function FormField ({id, label, type = 'text', value, onChange, placeholder}) {
    return(
        <div className = "form-field">
            <label className="form-field__label" htmlFor={id}>{label}
            </label>
            <input className="form-field__input"
                id = {id}
                type = {type}
                value ={value}
                onChange = {onChange}
                placeholder={placeholder}
            />
        </div>
    )
};

export default FormField
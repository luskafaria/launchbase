module.exports = {

  date(timestamp) {
    const date = new Date(timestamp)
    //yyyy
    const year = date.getUTCFullYear();
    //mm
    const month = `0${date.getUTCMonth() + 1}`.slice(-2);
    //dd
    const day = `0${date.getUTCDate()}`.slice(-2);
    //yyyy/mm/dd
    const hour = date.getHours();
    const minutes = date.getMinutes();

    return {
      minutes,
      hour,
      day,
      month,
      year,
      iso: `${year}-${month}-${day}`,
      birthDay: `${day}/${month}`,
      format: `${day}/${month}/${year}`
    };

  },
  formatPrice(price) {

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100)
  },
  formatCpfCnpj(value) {
    value = value.replace(/\D/g, "")

    if (value.length > 14) {
      value = value.slice(0, -1)
    }

    //check if it is cpf or cnpj
    //cnpj 11.222.333/0004-56
    if (value.length > 11) {
      //11.222333000456
      value = value.replace(/(\d{2})(\d)/, "$1.$2")
      //11.222.333000456
      value = value.replace(/(\d{3})(\d)/, "$1.$2")
      //11.222.333000456
      value = value.replace(/(\d{3})(\d)/, "$1/$2")
      //11.222.333/0004-56
      value = value.replace(/(\d{4})(\d)/, "$1-$2")

      //cpf 111.222.333-45
    } else {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d)/, "$1.$2.$3-$4")

    }

    return value
  },
  formatCep(value) {
    value = value.replace(/\D/g, "")

    if (value.length > 8) value = value.slice(0, -1)

    value = value.replace(/(\d{5})(\d)/, "$1-$2")

    return value
  }
}
const Payment = () => {
  return (
    <div className="order-summary w-[40%] p-1.5 bg-[#c4c2c2] rounded-[50px] shadow-2xl mt-10 flex h-[400px]">
        <div className="w-[100%] h-[100%] bg-[#eae8e8] rounded-[45px] p-5 flex flex-col  shadow-2xl">
          <h2 className="font-bold text-lg mb-7 text-center">Payment Sumary</h2>
          <div className="flex font-semibold justify-between mb-3">
            <span>Subtotal</span>
            <span className="font-bold">{/*formatMoney({priceCents: totals.subtotalCents})*/}</span>
          </div>
          <div className="flex font-semibold justify-between mb-3">
            <span>Shipping</span>
            <span className="font-bold">{/*
              formatMoney({priceCents : totals.shippingCents})
              */}</span>
          </div>
          <div className="flex font-semibold justify-between mb-3">
            <span>Discount(-20%)</span>
            <span className="font-bold">-$42</span>
          </div>
          <div className="flex font-semibold justify-between mb-10">
            <span>Delivery Fee</span>
            <span className="font-bold">{/*formatMoney({priceCents : totals.deliveryFeeCents})*/}</span>
          </div>
          <hr />
          <div className="flex justify-between font-bold text-lg mt-4">
            <span>Total</span>
            <span>{/*
              formatMoney({priceCents : totals.totalCents})
             */ }</span>
          </div>
          <button className="bg-[#000] text-white py-2 px-4 rounded-[20px] mt-[10%] cursor-pointer">
            Pay and Checkout
          </button>
        </div>
      </div> 
            );
}
export default Payment;
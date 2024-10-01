import ImageGallery from "react-image-gallery";
import React from 'react';
const images = [
    {
        original: "https://cdn.discordapp.com/attachments/740507693323911251/1289296679560024065/IMG_3932.jpg?ex=66fcebda&is=66fb9a5a&hm=8b5fe79598ad481e153ab29b6e59c3f071e397353f54f3c208831710a86e9d79&"
        ,thumbnail: "https://cdn.discordapp.com/attachments/740507693323911251/1289296679560024065/IMG_3932.jpg?ex=66fcebda&is=66fb9a5a&hm=8b5fe79598ad481e153ab29b6e59c3f071e397353f54f3c208831710a86e9d79&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/740507693323911251/1289021743985590393/image.jpg?ex=66fd3d4c&is=66fbebcc&hm=a85a6d5852148126cc586009ce75c9b1860d583bec62298f08b66025a1dec854&"
        ,thumbnail: "https://cdn.discordapp.com/attachments/740507693323911251/1289021743985590393/image.jpg?ex=66fd3d4c&is=66fbebcc&hm=a85a6d5852148126cc586009ce75c9b1860d583bec62298f08b66025a1dec854&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775751561418/image.jpg?ex=66fd942d&is=66fc42ad&hm=95cc6614900c1b4192dfa80732f0568856d311cb54f30100f275a09235fa890f&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775592308877/image.jpg?ex=66fd942d&is=66fc42ad&hm=dc18d8799a2e5dfd99d9bc463c7e2ca8fc6a61d3d38a1a54f292b3bb7af37ebb&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775625736292/image.jpg?ex=66fd942d&is=66fc42ad&hm=ead315921c264ffa3c8cfbc4af5b62f5e09bf5eee6d51743921350a5ba593397&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775625736292/image.jpg?ex=66fd942d&is=66fc42ad&hm=ead315921c264ffa3c8cfbc4af5b62f5e09bf5eee6d51743921350a5ba593397&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775193854056/image.jpg?ex=66fd942d&is=66fc42ad&hm=9c6808c679d3b5796695f1f9bc696b9eb7118c054604e70817b1480e6cbb4f3b&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775193854056/image.jpg?ex=66fd942d&is=66fc42ad&hm=9c6808c679d3b5796695f1f9bc696b9eb7118c054604e70817b1480e6cbb4f3b&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775411826769/image.jpg?ex=66fd942d&is=66fc42ad&hm=586471bf5077e0e5819922ab6bf5f3f65e2a555d7834be1e7051140a0324cbab&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775411826769/image.jpg?ex=66fd942d&is=66fc42ad&hm=586471bf5077e0e5819922ab6bf5f3f65e2a555d7834be1e7051140a0324cbab&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775307100202/image.jpg?ex=66fd942d&is=66fc42ad&hm=0caad167c1eb3c9a999989e90a9c2ac42cf4b71b8c6a57a5c04e78f539b11004&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775307100202/image.jpg?ex=66fd942d&is=66fc42ad&hm=0caad167c1eb3c9a999989e90a9c2ac42cf4b71b8c6a57a5c04e78f539b11004&"

    },{
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775797571767/image.jpg?ex=66fd942d&is=66fc42ad&hm=5a4a0036b7450a05053fdc52cfdd5c758ba55c64caca567bcf71c87330c39618&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775797571767/image.jpg?ex=66fd942d&is=66fc42ad&hm=5a4a0036b7450a05053fdc52cfdd5c758ba55c64caca567bcf71c87330c39618&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775172616213/image.jpg?ex=66fd942d&is=66fc42ad&hm=2233e2c6a302557dc1ca18381b21c6996d8e5799ae0e18474f76aab980a0dc2d&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775172616213/image.jpg?ex=66fd942d&is=66fc42ad&hm=2233e2c6a302557dc1ca18381b21c6996d8e5799ae0e18474f76aab980a0dc2d&"
    },{
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775092924506/image.jpg?ex=66fd942d&is=66fc42ad&hm=3350d45abab54c49bda2d345f9318a9c9d02efb3f95325d13a160ba20e99618d&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745775092924506/image.jpg?ex=66fd942d&is=66fc42ad&hm=3350d45abab54c49bda2d345f9318a9c9d02efb3f95325d13a160ba20e99618d&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774656721008/image.jpg?ex=66fd942d&is=66fc42ad&hm=8f251fb5d3ee1b2efd20e6f85844899b40f80dc0d8c03b124a26ca46748685e2&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774656721008/image.jpg?ex=66fd942d&is=66fc42ad&hm=8f251fb5d3ee1b2efd20e6f85844899b40f80dc0d8c03b124a26ca46748685e2&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774656721008/image.jpg?ex=66fd942d&is=66fc42ad&hm=8f251fb5d3ee1b2efd20e6f85844899b40f80dc0d8c03b124a26ca46748685e2&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774656721008/image.jpg?ex=66fd942d&is=66fc42ad&hm=8f251fb5d3ee1b2efd20e6f85844899b40f80dc0d8c03b124a26ca46748685e2&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774556188837/image.jpg?ex=66fd942d&is=66fc42ad&hm=86a066213465717624f2ecdcb36eec7e205d6e6b5e057e46d6a849e37fbbe150&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774556188837/image.jpg?ex=66fd942d&is=66fc42ad&hm=86a066213465717624f2ecdcb36eec7e205d6e6b5e057e46d6a849e37fbbe150&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774623162520/image.jpg?ex=66fd942d&is=66fc42ad&hm=28df3cb6e9e6ff60b8c0bc90959ae7ca3f93cc985e27f7da9112eabd0d47e15e&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774623162520/image.jpg?ex=66fd942d&is=66fc42ad&hm=28df3cb6e9e6ff60b8c0bc90959ae7ca3f93cc985e27f7da9112eabd0d47e15e&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774082228398/image.jpg?ex=66fd942d&is=66fc42ad&hm=ff413510a5acdd0d813993d0eae0feeecc15983b5d7ce77700045818c0fceff4&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774082228398/image.jpg?ex=66fd942d&is=66fc42ad&hm=ff413510a5acdd0d813993d0eae0feeecc15983b5d7ce77700045818c0fceff4&"
    },
    {
        original:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774266912788/image.jpg?ex=66fd942d&is=66fc42ad&hm=89831e51b0a98d0f7ef1cc0bdf513ffeb3676e97c35f406e8d460da60b305a43&",
        thumbnail:"https://cdn.discordapp.com/attachments/934381934581268530/1290745774266912788/image.jpg?ex=66fd942d&is=66fc42ad&hm=89831e51b0a98d0f7ef1cc0bdf513ffeb3676e97c35f406e8d460da60b305a43&"
    }
]

class toastgallery extends React.Component {
    render() {
      return <ImageGallery items={images} />;
    }
  }

const Toast = () => {
    return (
        <div>
            <toastgallery/>
        </div>
    );
};
export default Toast;